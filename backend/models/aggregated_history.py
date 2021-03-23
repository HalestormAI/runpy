import datetime
from enum import Enum

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
            '$match': {
                'type': 'Run'
            }
        },
        {
            '$addFields': {
                'dt': {
                    '$dateFromString': {
                        'dateString': '$start_date'
                    }
                }
            }
        }, {
            '$group': {
                '_id': {
                    'wk': {'$isoWeek': '$dt'},
                    'yr': {'$isoWeekYear': '$dt'}
                },
                'runs': {
                    '$push': {
                        'id': '$id',
                        'name': '$name',
                        'date': '$start_date',
                        'distance': '$distance',
                        'time': '$moving_time',
                        'speed': '$average_speed',
                        'elevation': '$total_elevation_gain'
                    }
                },
                'weekly_agg': {
                    '$sum': '$' + search_type.value
                }
            }
        }
    ]

    def maybe_convert_date(dt, fmt):
        if dt is None:
            return None

        if isinstance(dt, datetime.datetime):
            return dt

        return datetime.datetime(dt, fmt)

    if start_date is not None or end_date is not None:
        date_bounds_filter = {}

        if start_date is not None:
            date_bounds_filter['$gte'] = maybe_convert_date(start_date, '%d/%m/%y')
        if end_date is not None:
            date_bounds_filter['$lte'] = maybe_convert_date(end_date, '%d/%m/%y')

        agg_query.insert(1, {
            '$match': {
                "dt": date_bounds_filter
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
            "count": row["weekly_agg"],
            "runs": row["runs"]
        })

    # Sort then convert datetime to string for output serialisation
    outputs = [{
        "date": v["date"].strftime("%Y-%m-%d"),
        "count": v["count"],
        "runs": v["runs"]
    } for v in sorted(outputs, key=lambda item: item["date"])]

    return outputs
