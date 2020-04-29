from flask import Blueprint
from flask_restful import Api, Resource

from backend.core.config import Config
from backend.models.geo_pace import GeoSpeedModel


class GeoSpeedForBounds(Resource):

    def get(self, north_east, south_west):
        north_east = [float(f) for f in north_east.split(",")]
        south_west = [float(f) for f in south_west.split(",")]
        return GeoSpeedModel.get_for_bounds(north_east, south_west)


def blueprint(app):
    api_bp = Blueprint('geo_search_api', __name__)
    api = Api(api_bp)
    api.add_resource(GeoSpeedForBounds, '/geo/speed/<string:north_east>/<string:south_west>', endpoint="speed")
    app.register_blueprint(api_bp, url_prefix=Config.get_instance()["server"]["v1_api"])
