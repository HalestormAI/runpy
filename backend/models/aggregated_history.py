import datetime
from enum import Enum
import numpy as np
import pandas as pd
from scipy import stats

from backend.core import mongo

class SearchTypes(Enum):
    DISTANCE = "distance"
    MOVING_TIME = "moving_time"
    ELAPSED_TIME = "elapsed_time"
    AVG_SPEED = "average_speed"
    MAX_SPEED = "max_speed"
    ELEVATION = "total_elevation_gain"


def aggregated_weekly_history(search_type=SearchTypes.DISTANCE, start_date=None, end_date=None):

    # Force the type argument to be a valid one (will except if not valid)
    if not isinstance(search_type, SearchTypes):
        search_type = SearchTypes(search_type)

    agg_query = [
        {
            '$project': {
                search_type.value: 1,
                'id': 1,
                'name': 1,
                'dt': {
                    '$dateFromString': {
                        'dateString': '$start_date'
                    }
                }
            }
        }, {
            '$group': {
                '_id': {
                    'wk': {'$week': '$dt'},
                    'yr': {'$year': '$dt'}
                },
                'weekly_agg': {
                    '$sum': '$' + search_type.value
                }
            }
        }
    ]

    if start_date is not None or end_date is not None:
        if start_date is not None and end_date is not None:
            date_bounds_filter = {
                '$and': {
                    '$gte': datetime.datetime.strptime(start_date, '%Y-%m-%d %H:%M:%S'),
                    '$lte': datetime.datetime.strptime(end_date, '%Y-%m-%d %H:%M:%S')
                }
            }
        elif start_date is not None:
            date_bounds_filter = {'$gte': datetime.datetime.strptime(start_date, '%d/%m/%y %H:%M:%S')}
        else:
            date_bounds_filter = {'$lte': datetime.datetime.strptime(end_date, '%d/%m/%y %H:%M:%S')}

        agg_query.insert(1, {
            '$match': {
                'dt': date_bounds_filter
            }
        })

    db = mongo.factory.default_client()
    cur = db.activities.aggregate(agg_query)

    outputs = []
    for row in cur:
        if row["_id"]["yr"] is None:
            break

        year = row["_id"]["yr"]
        week = row["_id"]["wk"]

        dt = datetime.datetime.strptime(f"{year}-W{week}-1", "%Y-W%W-%w")
        outputs.append({
            "date": dt,
            "count": row["weekly_agg"]
        })

    # Sort then convert datetime to string for output serialisation
    outputs = [{
        "date": v["date"].strftime("%Y-%m-%d"),
        "count": v["count"]
    } for v in sorted(outputs, key=lambda item: item["date"])]

    return {
        "result": outputs
    }
