import logging
import os

import maya
import progressbar
import stravaio

from core.connection import StravaConnectedObject, Config

logger = logging.getLogger()


class ProgressException(Exception):
    def __init__(self, log):
        super(ProgressException, self).__init__()
        self.log = log


class ProgressStatus(object):
    def __init__(self):
        self._num = -1
        self._current = -1
        self._running = False

        self._log = []

    def start(self, ):
        if self._running:
            raise ProgressException("Cannot start: downloader already running.")

        self._log.clear()
        self._current = 0
        self._running = True

    def set_num(self, num):
        if self._running:
            raise ProgressException("Cannot update count: downloader already running.")
        self._num = num

    def next(self):
        if not self._running:
            raise ProgressException("Cannot call next: downloader not running.")
        if self._num < 0:
            raise ProgressException("Cannot call next: count not initialised.")
        self._current += 1

    def log(self, s):
        self._log.append(s)

    def end(self):
        self._num = -1
        self._current = -1
        self._running = False

    @property
    def running(self):
        return self._running


class ActivityDownloader(StravaConnectedObject):

    def __init__(self, config):
        super().__init__(config)

        self.running = False
        self.progress = ProgressStatus()

    def is_activity_cached(self, id):
        cache_dir = os.path.join(stravaio.dir_stravadata(), f'activities_{self.athlete_id}')
        cache_fn = os.path.join(cache_dir, f'activity_{id}.json')
        return os.path.isfile(cache_fn)

    def download_latest_activities(self):
        if not self.progress.running:
            if self.client is None:
                self.connect()

            try:
                last_download = self.config['strava']['_last_download']
            except KeyError:
                last_download = 0

            # stravaio only supports run or ride at the moment: TODO: Update in fork
            activities = self.client.get_logged_in_athlete_activities(after=last_download)
            activities = [a for a in activities if a.type in ['Run', 'Ride']]
            self.progress.set_num(len(activities))
            self.progress.start()

            self.config['strava']['_last_download'] = str(maya.now())
            self.config.save()

            for a in progressbar.progressbar(activities):
                # TODO: Modify fork of stravaio to include a check for local storage
                self.progress.log(f"Downloading activity {a.id}")
                if not self.is_activity_cached(a.id):
                    self.progress.log(f"Storing activity {a.id} locally")
                    activity = self.client.get_activity_by_id(a.id)
                    activity.store_locally()
                self.progress.next()

            self.progress.end()

    def clear_data(self):
        if '_last_download' in self.config['strava']:
            del self.config['strava']['_last_download']
            self.config.save()


if __name__ == "__main__":
    config = Config.create_instance('../config.json')
    dl = ActivityDownloader(config)
    dl.download_latest_activities()
