from flask import Blueprint
from flask_restful import Api
from flask_restful import Resource

from core.connection import Config, AuthenticationError
from core.data_downloader import ActivityDownloader


class DownloaderFactory(Resource):
    downloader = None

    @staticmethod
    def get():
        if DownloaderFactory.downloader is None:
            config = Config('config.json')
            DownloaderFactory.downloader = ActivityDownloader(config)
        return DownloaderFactory.downloader


class ActivityDownload(Resource):

    def get(self):
        downloader = DownloaderFactory.get()
        # TODO: Thread this
        try:
            downloader.download_latest_activities()
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


class CleanActivities(Resource):

    def get(self):
        try:
            downloader = DownloaderFactory.get()
            downloader.clear_data()
            return {
                "status": "done",
                "message": "Done"
            }
        except Exception as err:
            return {
                "status": "error",
                "message": f"Unknown error: {str(err)}"
            }


def blueprint(app):
    api_bp = Blueprint('download_api', __name__)
    api = Api(api_bp)
    api.add_resource(ActivityDownload, '/data/fetch')
    api.add_resource(CleanActivities, '/data/clear')
    app.register_blueprint(api_bp, url_prefix=Config.instance["server"]["v1_api"])
