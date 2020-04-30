from flask import Blueprint
from flask_restful import Api, reqparse
from flask_restful import Resource

from ..core.config import Config
from ..core.running_stats import StatHandlers


class ActivitySearch(Resource):

    def __init__(self):
        super().__init__()

    def get(self, search_type, name="", lower_distance=None, upper_distance=None):
        if search_type == "distance":
            return self.distance_search(lower_distance, upper_distance)
        if search_type == "name":
            return self.name_search(name)
        if search_type == "rolling":
            return self.rolling_average()

        return {
            "message": "Error: Search type not provided",
        }

    def distance_search(self, lower_distance, upper_distance):
        activities = StatHandlers.get("distance_range").get_activities(lower_distance, upper_distance)
        return {
            "message": "distance",
            "activities": activities
        }

    def name_search(self, name):
        activities = StatHandlers.get("name").get_activities(name)
        return {
            "message": "name",
            "activities": activities
        }

    def rolling_average(self):
        parser = reqparse.RequestParser()
        parser.add_argument("frequency", type=str, default="monthly",
                            help="Frequency of the rolling average, either 'monthly' or 'weekly' (defaults to monthly)")
        args = parser.parse_args()

        if args.frequency.lower() not in ["monthly", "weekly"]:
            # TODO: Make this return the right status code
            #  - see https://stackoverflow.com/questions/41149409/flask-restful-custom-error-handling
            raise reqparse.ValueError("Invalid frequency provided: must be one of [monthly, weekly]")
        activities = StatHandlers.get("windowedActivityPace").get_activities(args.frequency)
        return {
            "message": "name",
            "activities": activities
        }


def blueprint(app):
    api_bp = Blueprint('search_api', __name__)
    api = Api(api_bp)
    api.add_resource(ActivitySearch, '/search/<string:search_type>/<int:lower_distance>/<int:upper_distance>',
                     endpoint="distance")
    api.add_resource(ActivitySearch, '/search/<string:search_type>/<string:name>', endpoint="name")
    api.add_resource(ActivitySearch, '/search/<string:search_type>', endpoint="rolling")
    app.register_blueprint(api_bp, url_prefix=Config.get_instance()["server"]["v1_api"])
