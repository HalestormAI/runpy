import logging

import maya
import progressbar

from .downloader import (
    AbstractDownloader,
    DownloadBuffer
)
from .. import mongo
from ...models.activity_model import ActivityModel

logger = logging.getLogger("runpy")


class ActivityDownloader(AbstractDownloader):
    def __init__(self, config):
        super().__init__(config)

    def download(self):
        if self.progress.running:
            return

        self.connect_if_required()
        db = mongo.factory.default_client()

        def buffer_cb(activities):
            return db.activities.insert_many(activities)

        download_buffer = DownloadBuffer(self.config["server"]["max_download_buffer"], buffer_cb)

        # stravaio only supports run or ride at the moment: TODO: Update in fork
        last_download = self.config['strava'].get('_last_download', 0)

        activity_ids = self.client.get_logged_in_athlete_activities(after=last_download)
        activity_ids = [a for a in activity_ids if a.type in ['Run', 'Ride']]
        activity_ids = [a for a in activity_ids if not ActivityModel.exists(db.activities, a.id)]

        self.progress.set_num(len(activity_ids))
        self.progress.start()

        # Run through all activity IDs, check if we've already stored them. If not, pull the summary and store
        # TODO: What about updating after edits?
        downloaded_activities = []
        try:
            for a in progressbar.progressbar(activity_ids):
                self.progress.log(f"Downloading activity {a.id}")
                self.progress.log(f"Storing activity {a.id} in database")
                activity = self.client.get_activity_by_id(a.id)
                download_buffer.add(activity.to_dict())
                downloaded_activities.append(activity.to_dict())
                self.progress.next()

        finally:
            if len(download_buffer) > 0:
                download_buffer.flush()
            self.progress.end()

        # Update the config last download date
        self.config['strava']['_last_download'] = str(maya.now())
        self.config.save()
        return downloaded_activities

    def clear(self):
        if '_last_download' in self.config['strava']:
            del self.config['strava']['_last_download']
            self.config.save()
        db = mongo.factory.default_client()
        db.activities.remove({})
