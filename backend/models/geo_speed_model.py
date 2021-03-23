import numpy as np
import pandas as pd
from scipy import stats

from backend.core import mongo


# TODO: This should probably become a transform

def geo_speed_for_bounds(north_east, south_west, granularity=3, intersect=False):
    c_e, c_n = north_east
    c_w, c_s = south_west

    coordinates = [
        [c_e, c_n],
        [c_w, c_n],
        [c_w, c_s],
        [c_e, c_s],
        [c_e, c_n]
    ]

    lat_bounds = [c_n, c_s]
    lon_bounds = [c_e, c_e]
    agg_query = [
        {
            '$match': {
                'geoIndex': {
                    '$geoIntersects' if intersect else '$geoWithin': {
                        '$geometry': {
                            'type': 'Polygon',
                            'coordinates': [coordinates]
                        }
                    }
                }
            }
        }, {
            '$lookup': {
                'from': 'activities',
                'localField': 'activity_id',
                'foreignField': 'id',
                'as': 'full_act'
            }
        }, {
            '$unwind': '$full_act'
        }, {
            '$match': {
                'full_act.type': {
                    '$eq': 'Run'
                }
            }
        }, {
            '$project': {
                '_id': None,
                'lats': {
                    '$map': {
                        'input': '$data.lat',
                        'as': 'decimalValue',
                        'in': {
                            '$trunc': [
                                '$$decimalValue', granularity
                            ]
                        }
                    }
                },
                'lngs': {
                    '$map': {
                        'input': '$data.lng',
                        'as': 'decimalValue',
                        'in': {
                            '$trunc': [
                                '$$decimalValue', granularity
                            ]
                        }
                    }
                },
                'spd': '$data.velocity_smooth'
            }
        }
    ]

    db = mongo.factory.default_client()
    cur = db.streams.aggregate(agg_query)

    data = []
    for row in cur:
        if row["lats"] is None or row["lngs"] is None or row["spd"] is None:
            continue
        try:
            for lat, lng, spd in zip(row["lats"], row["lngs"], row["spd"]):
                data.append((lat, lng, spd))
        except Exception as err:
            print(err)

    output = pd.DataFrame(data, columns=("lat", "lng", "speed"))

    if output.size == 0:
        return {
            "points": [],
            "stats": None
        }

    # Filter out likely bad entries
    if intersect:
        # intersect gives us loads of points outside the viewport bounds that we don't need to process
        # TODO: This should probably be part of the mongo aggregation...
        valid_lat = output["lat"].between(c_s, c_n)
        valid_lng = output["lng"].between(c_w, c_e)
        output = output[valid_lng & valid_lat]
    output = output[(np.abs(stats.zscore(output["speed"])) < 3)]
    output = output.groupby(["lat", "lng"])
    output = output.mean()

    # Min/max normalise
    output = (output - output.min())
    output = output / output.max()

    return {
        "points": output.reset_index().values.tolist(),
        "stats": {
            "mean": output.mean().values[0],
            "std": output.std().values[0],
            "max": output.max().values[0],
            "min": output.min().values[0],
        }
    }
