import json
import logging

import stravaio

logger = logging.getLogger("runpy")


class Config(object):
    __CONFIG_FILE_NAME = "backend/config.json"
    _instance = None

    def __init__(self, file_path):
        self.path = file_path
        self._data = self._load()

    def _load(self):
        with open(self.path, 'r') as fh:
            return json.load(fh)

    def save(self):
        with open(self.path, 'w') as fh:
            json.dump(self._data, fh, indent=2)

    def get_token(self, force_reauth=False):
        if not force_reauth:
            try:
                return self._data['strava']['_token']
            except KeyError:
                logger.info("Token not found in config. Refreshing.")

        token = stravaio.strava_oauth2(client_id=self._data['strava']['client_id'],
                                       client_secret=self._data['strava']['client_secret'])

        self._data['strava']['_token'] = token
        self.save()

        return token

    def __getitem__(self, item):
        return self._data[item]

    @staticmethod
    def get_instance():
        if Config._instance is None:
            Config._instance = Config(Config.__CONFIG_FILE_NAME)
        return Config._instance
