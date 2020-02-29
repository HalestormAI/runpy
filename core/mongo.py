from pymongo import MongoClient

from core.config import Config


class MongoFactory:

    def __init__(self, config):
        self.config = config

    def default_client(self):
        return MongoClient(**self.config["mongo"]).runpy


factory = MongoFactory(Config.create_instance('config.json'))
