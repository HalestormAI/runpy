from flask import Blueprint
from flask_restful import Api
from flask_restful import Resource

from ..core.config import Config
from ..core.connection import AuthenticationError
from ..core.download.activities import ActivityDownloader
from ..core.download.downloader import DownloaderFactory
from ..core.download.gear import GearDownloader
from ..models.stream_model import ActivityStreamModel


class ActivityDownload(Resource):

    def get(self):
        activity_downloader = DownloaderFactory.get(ActivityDownloader)
        gear_downloader = DownloaderFactory.get(GearDownloader)
        # TODO: Thread this
        try:
            activities = activity_downloader.download()
            gear = gear_downloader.download()
            return {
                "status": "done",
                "message": "Done",
                "downloaded": {
                    "activities": activities,
                    "gear": gear
                }
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


class CleanActivities(Resource):

    def get(self):
        try:
            downloader = DownloaderFactory.get()
            downloader.clear()
            return {
                "status": "done",
                "message": "Done"
            }
        except Exception as err:
            return {
                "status": "error",
                "message": f"Unknown error: {str(err)}"
            }


class StreamFetch(Resource):
    def get(self, activity_id):
        stream_model = ActivityStreamModel(Config.get_instance())
        try:
            streams = stream_model.get(activity_id)
            return {
                "status": "done",
                "message": "Done",
                "streams": streams
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
    api.add_resource(ActivityDownload, '/data/fetch/activities')
    api.add_resource(CleanActivities, '/data/clear/activities')
    api.add_resource(StreamFetch, '/data/fetch/streams/<string:activity_id>')
    app.register_blueprint(api_bp, url_prefix=Config.get_instance()["server"]["v1_api"])
