from flask import Blueprint
from flask_restful import Api, Resource, reqparse

from backend.core.config import Config
from backend.core.utils import str_arg_is_true
from backend.models.geo_speed_model import geo_speed_for_bounds


class GeoSpeedForBounds(Resource):

    def get(self, north_east, south_west):
        parser = reqparse.RequestParser()
        parser.add_argument('granularity', type=int, default=3,
                            help="Precision of the Lat/Long index search (num DP). Higher values produce more precise "
                                 "data but at the cost of memory and process load. Recommended range (3-4)")
        parser.add_argument('intersect', type=str, default=None,
                            help="Use polygon intersection for geo search. If not supplied, we default to a 'within' "
                                 "query, which will provide fewer results out-of-bounds, possibly at the expense of "
                                 "tracks that leave the bounds")
        args = parser.parse_args()

        north_east = [float(f) for f in north_east.split(",")]
        south_west = [float(f) for f in south_west.split(",")]

        intersect = str_arg_is_true(args.intersect)
        return {
            "data": geo_speed_for_bounds(north_east, south_west, args.granularity, intersect)
        }


def blueprint(app):
    api_bp = Blueprint('geo_search_api', __name__)
    api = Api(api_bp)
    api.add_resource(GeoSpeedForBounds, '/geo/speed/<string:north_east>/<string:south_west>', endpoint="speed")
    app.register_blueprint(api_bp, url_prefix=Config.get_instance()["server"]["v1_api"])
