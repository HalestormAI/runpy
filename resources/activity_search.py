from flask import Blueprint
from flask_restful import Api
from flask_restful import Resource

from core.config import Config
from running_stats import StatHandlers


class ActivitySearch(Resource):

    def __init__(self):
        super().__init__()

    def get(self, search_type, name="", lower_distance=None, upper_distance=None):
        if search_type == "distance":
            return self.distance_search(lower_distance, upper_distance)
        if search_type == "name":
            return self.name_search(name)

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


def blueprint(app):
    api_bp = Blueprint('search_api', __name__ )
    api = Api(api_bp)
    api.add_resource(ActivitySearch, '/search/<string:search_type>/<int:lower_distance>/<int:upper_distance>', endpoint="distance")
    api.add_resource(ActivitySearch, '/search/<string:search_type>/<string:name>', endpoint="name")
    app.register_blueprint(api_bp, url_prefix=Config.instance["server"]["v1_api"])