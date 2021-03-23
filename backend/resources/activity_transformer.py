from flask import Blueprint
from flask_restful import Api
from flask_restful import Resource

from ..core import mongo
from ..core.config import Config
from ..models.stream_model import ActivityStreamModel
from ..transforms.activity_transform import get_transforms


class AbstractTransformApplier(Resource):
    """TODO: This should probably use ABC... """

    def get(self):
        self._apply()

    def _apply(self):
        raise NotImplementedError("Abstract method _apply should be overwritten by the concrete class")


class StreamModelTransformApplier(AbstractTransformApplier):
    """
    Transform existing models where the transformed output doesn't already exist
    """

    def __init__(self):
        self.transformers = get_transforms(ActivityStreamModel)
        self.db = mongo.factory.default_client()

    def _apply(self):
        for tform in self.transformers:
            # Find all documents for which the transform has not already been applied
            cursor = self.db.streams.find({tform.db_path: None}, projection={"activity_id": 1})
            for i, d in enumerate(cursor):
                tform.run_on_existing(d["activity_id"])
                if i > 0 and i % 10 == 0:
                    tform.commit()


def blueprint(app):
    api_bp = Blueprint('transformers_api', __name__)
    api = Api(api_bp)
    api.add_resource(StreamModelTransformApplier, '/transforms/streams', endpoint="transforms_streams")
    app.register_blueprint(api_bp, url_prefix=Config.get_instance()["server"]["v1_api"])
