from pymongo import MongoClient, GEOSPHERE

from .config import Config


class MongoFactory:

    def __init__(self, config):
        self.config = config

    def default_client(self):
        return MongoClient(**self.config["mongo"]).runpy


# TODO: This should be rigged into the setup script when such a thing exists
def create_indexes(db):
    db.streams.create_index([("geoIndex", GEOSPHERE)])


factory = MongoFactory(Config.get_instance())
