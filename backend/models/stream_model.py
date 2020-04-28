from datetime import datetime

from backend.core import mongo
from backend.core.connection import StravaConnectedObject


class ActivityStreamModel(StravaConnectedObject):

    def __init__(self, config):
        super().__init__(config)

    def get(self, activity_id):
        if activity_id is None:
            raise ValueError("Activity ID was not set")

        if self.client is None:
            self.connect()

        db = mongo.factory.default_client()

        # See if we've already got it, if so return from the DB
        existing_streams = db.streams.find_one({"activity_id": activity_id})
        if existing_streams is not None:
            return existing_streams["data"]

        streams = self.client.get_activity_streams(activity_id, self.athlete_id)

        streams_data = streams.to_dict()
        stream_doc = {
            "activity_id": activity_id,
            "data": streams_data,
            "fetch_date": datetime.now()
        }
        db.streams.insert_one(stream_doc)

        return stream_doc["data"]
