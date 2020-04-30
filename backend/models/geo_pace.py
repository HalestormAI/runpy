import numpy as np
import pandas as pd
from scipy import stats

from backend.core import mongo


class GeoSpeedModel(object):

    @staticmethod
    def get_for_bounds(north_east, south_west, granularity=3, intersect=False):
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

        output = output.mean()

        # Min/max normalise
        output = (output - output.min())
        output = output / output.max()
        return output.reset_index().values.tolist()
