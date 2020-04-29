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
                    'full_act.type': {'$eq': 'Run'}
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
                                    '$$decimalValue', 4
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
                                    '$$decimalValue', 4
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
        output = pd.DataFrame(data, columns=("lat", "lng", "speed")).groupby(["lat", "lng"])

        output = output.mean()
        output = (output - output.min())
        output = output / output.max()
        return output.reset_index().values.tolist()
