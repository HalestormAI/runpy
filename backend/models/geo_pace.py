import pandas as pd

from backend.core import mongo


class GeoSpeedModel(object):

    @staticmethod
    def get_for_bounds(north_east, south_west):
        c_e, c_n = north_east
        c_w, c_s = south_west

        coordinates = [
            [c_e, c_n],
            [c_w, c_n],
            [c_w, c_s],
            [c_e, c_s],
            [c_e, c_n]
        ]

        agg_query = [
            {
                '$match': {
                    'geoIndex': {
                        '$geoIntersects': {
                            '$geometry': {
                                'type': 'Polygon',
                                'coordinates': [coordinates]
                            }
                        }
                    }
                }
            }, {
                '$project': {
                    '_id': None,
                    'lats': {
                        '$map': {
                            'input': '$data.lat',
                            'as': 'decimalValue',
                            'in': {'$trunc': ['$$decimalValue', 3]
                                   }
                        }
                    },
                    'lngs': {
                        '$map': {
                            'input': '$data.lng',
                            'as': 'decimalValue',
                            'in': {'$trunc': ['$$decimalValue', 3]
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
            for lat, lng, spd in zip(row["lats"], row["lngs"], row["spd"]):
                data.append((lat, lng, spd))
        output = pd.DataFrame(data, columns=("lat", "lng", "speed")).groupby(["lat", "lng"]).mean()

        return {
            "data": output.reset_index().values.tolist()
        }
