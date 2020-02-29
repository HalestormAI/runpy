import json
import logging
import sys

import stravaio

logger = logging.getLogger()
logger.setLevel(logging.DEBUG)
handler = logging.StreamHandler(sys.stdout)
handler.setLevel(logging.DEBUG)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)
logger.addHandler(handler)


class Config(object):
    instance = None

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
    def create_instance(file_path):
        Config.instance = Config(file_path)
        return Config.instance
