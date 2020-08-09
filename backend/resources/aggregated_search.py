import datetime

from flask import Blueprint
from flask_restful import Api, Resource, reqparse

from backend.core.config import Config
from backend.models.aggregated_history import aggregated_weekly_history, SearchTypes


class AggregatedSearch(Resource):

    def get(self, search_type):

        def valid_date(dt):
            try:
                return datetime.strptime(dt, "%Y-%m-%d %H:%M:%S")
            except ValueError:
                msg = "Not a valid date: '{0}'.".format(s)
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



def blueprint(app):
    api_bp = Blueprint('aggregated_search_api', __name__)
    api = Api(api_bp)
    api.add_resource(AggregatedSearch, '/aggregated/<search_type>', endpoint="aggregated_search")
    app.register_blueprint(api_bp, url_prefix=Config.get_instance()["server"]["v1_api"])
