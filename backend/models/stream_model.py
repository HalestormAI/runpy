from datetime import datetime

from pymongo import ReplaceOne

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
            return existing_streams

        streams = self.client.get_activity_streams(activity_id, self.athlete_id)
        stream_doc = ActivityStreamModel.doc_from_strava(activity_id, streams)
        db.streams.insert_one(stream_doc)

        return stream_doc

    def update_many(self, activities):
        if self.client is None:
            self.connect()

        ops = [ReplaceOne({"activity_id": a}, d, upsert=False) for a, d in activities.items()]
        db = mongo.factory.default_client()
        result = db.streams.bulk_write(ops)

        if result.matched_count != len(activities):
            raise RuntimeError(f"Failed to update all documents ({result['nMatched']}) / {len(activities)}")

    @staticmethod
    def doc_from_strava(activity_id, strava_data):
        streams_data = strava_data.to_dict()
        if "lng" in streams_data and "lat" in streams_data:
            geo = {
                "type": "LineString",
                "coordinates": [c for c in zip(streams_data["lng"], streams_data["lat"])]
            }
        else:
            geo = {}
        return {
            "activity_id": int(activity_id),
            "data": streams_data,
            "fetch_date": datetime.now(),
            "geoIndex": geo
        }

    @staticmethod
    def empty_doc(activity_id):
        return {
            "activity_id": int(activity_id),
            "data": {},
            "fetch_date": datetime.now()
        }

    @staticmethod
    def exists(collection, activity_id):
        return collection.count_documents({"id": int(activity_id)}, limit=1) > 0
