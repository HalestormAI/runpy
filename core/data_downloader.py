import logging

import maya
import progressbar

import core.mongo
from core.config import Config
from core.connection import StravaConnectedObject
from models.activity_model import ActivityModel

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


class DownloadBuffer(object):
    def __init__(self, buffer_len, full_cb):
        self.buffer_len = buffer_len
        self.flush_callback = full_cb
        self.buffer = []

    def add(self, activity):
        self.buffer.append(activity.to_dict())
        if len(self.buffer) > self.buffer_len:
            self.flush()

    def flush(self):
        self.flush_callback(self.buffer)
        self.buffer.clear()

    def __len__(self):
        return len(self.buffer)


class ActivityDownloader(StravaConnectedObject):
    def __init__(self, config):
        super().__init__(config)

        self.running = False
        self.progress = ProgressStatus()

    def download_latest_activities(self):
        if not self.progress.running:
            if self.client is None:
                self.connect()

            db = core.mongo.factory.default_client()

            def buffer_cb(activities):
                result = db.activities.insert_many(activities)
                print(result.inserted_ids)
                return result

            download_buffer = DownloadBuffer(self.config["server"]["max_download_buffer"], buffer_cb)

            # stravaio only supports run or ride at the moment: TODO: Update in fork
            last_download = self.config['strava'].get('_last_download', 0)
            activity_ids = self.client.get_logged_in_athlete_activities(after=last_download)
            activity_ids = [a for a in activity_ids if a.type in ['Run', 'Ride']]
            self.progress.set_num(len(activity_ids))
            self.progress.start()

            # Run through all activity IDs, check if we've already stored them. If not, pull the summary and store
            # TODO: What about updating after edits?
            for a in progressbar.progressbar(activity_ids):
                self.progress.log(f"Downloading activity {a.id}")
                if not ActivityModel.exists(db.activities, a.id):
                    self.progress.log(f"Storing activity {a.id} in database")
                    activity = self.client.get_activity_by_id(a.id)
                    download_buffer.add(activity)
                self.progress.next()

            if len(download_buffer) > 0:
                download_buffer.flush()

            self.progress.end()

            # Update the config last download date
            self.config['strava']['_last_download'] = str(maya.now())
            self.config.save()

    def clear_activities(self):
        if '_last_download' in self.config['strava']:
            del self.config['strava']['_last_download']
            self.config.save()


if __name__ == "__main__":
    config = Config.create_instance('../config.json')
    dl = ActivityDownloader(config)
    dl.download_latest_activities()
