from flask import Blueprint
from flask_restful import Api
from flask_restful import Resource

from core.connection import Config
from core.data_downloader import ActivityDownloader


class ActivityDownload(Resource):

    downloader = None

    def get(self):
        if self.downloader is None:
            config = Config('config.json')
            self.downloader = ActivityDownloader(config)

        self.downloader.download_latest_activities()

        return {"message": "Downloading..."}


def blueprint(app):
    api_bp = Blueprint('download_api', __name__ )
    api = Api(api_bp)
    api.add_resource(ActivityDownload, '/fetch')
    app.register_blueprint(api_bp, url_prefix=Config.instance["server"]["v1_api"])
