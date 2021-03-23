import datetime

from flask import Blueprint
from flask_restful import Api, Resource, reqparse

from backend.core import mongo
from backend.core.config import Config
from backend.models.aggregated_history import aggregated_weekly_history


class AggregatedSearch(Resource):

    def get(self, search_type):

        def valid_date(dt):
            try:
                return datetime.datetime.strptime(dt, "%Y-%m-%d")
            except ValueError:
                msg = "Not a valid date: '{0}'.".format(dt)
                raise reqparse.ArgumentTypeError(msg)

        parser = reqparse.RequestParser()
        parser.add_argument("start_date", type=valid_date, default=None,
                            help="Start date for filtering results (defaults to None)")
        parser.add_argument("end_date", type=valid_date, default=None,
                            help="End date for filtering results (defaults to None)")
        args = parser.parse_args()
        return {
            "data": aggregated_weekly_history(search_type, args.start_date, args.end_date)
        }


class DistanceRecords(Resource):

    def get(self, distance):
        agg_query = [
            {
                '$lookup': {
                    'from': 'activities',
                    'localField': 'activity_id',
                    'foreignField': 'id',
                    'as': 'source'
                }
            }, {
                '$project': {
                    'transforms': 1,
                    'activity_id': 1,
                    'type': {'$arrayElemAt': ['$source.type', 0]},
                    'start_date': {'$arrayElemAt': ['$source.start_date', 0]},
                    'name': {'$arrayElemAt': ['$source.name', 0]},
                    'distance': {'$arrayElemAt': ['$source.distance', 0]},
                    'time': {'$arrayElemAt': ['$source.moving_time', 0]}
                }
            }, {
                '$match': {
                    '$and': [
                        {'type': 'Run'},
                        {f"transforms.distance_record.{distance}": {'$exists': True}}
                    ]
                }
            }, {
                '$project': {
                    'activity_id': 1,
                    'record': f"$transforms.distance_record.{distance}",
                    'name': 1,
                    'distance': 1,
                    'date': "$start_date"
                }
            },
            {'$sort': {'date': 1}},
        ]

        db = mongo.factory.default_client()
        cur = db.streams.aggregate(agg_query)

        def removeObjectId(d):
            return {k: v for k, v in d.items() if k != "_id"}

        data = [removeObjectId(d) for d in cur]
        return {"data": data, "distance": distance}


def blueprint(app):
    api_bp = Blueprint('aggregated_search_api', __name__)
    api = Api(api_bp)
    api.add_resource(AggregatedSearch, '/aggregated/<search_type>', endpoint="aggregated_search")
    api.add_resource(DistanceRecords, '/records/running/<distance>', endpoint="distance_record_search")
    app.register_blueprint(api_bp, url_prefix=Config.get_instance()["server"]["v1_api"])
