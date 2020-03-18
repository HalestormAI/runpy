from flask import Blueprint
from flask_restful import Api
from flask_restful import Resource

from ..core.config import Config
from ..core.connection import AuthenticationError
from ..core.download.downloader import DownloaderFactory
from ..core.download.gear import GearDownloader


class GearDownload(Resource):

    def get(self):
        gear_downloader = DownloaderFactory.get(GearDownloader)
        # TODO: Thread this
        try:
            gear_downloader.download()
            return {
                "status": "done",
                "message": "Done"
            }
        except AuthenticationError as err:
            return {
                "status": "error",
                "message": f"Authentication Failed: {str(err)}"
            }
        except Exception as err:
            return {
                "status": "error",
                "message": f"Unknown error: {str(err)}"
            }


def blueprint(app):
    api_bp = Blueprint('download_api', __name__)
    api = Api(api_bp)
    api.add_resource(GearDownload, 'data//fetch/gear')
    app.register_blueprint(api_bp, url_prefix=Config.get_instance()["server"]["v1_api"])
