import progressbar
import stravaio

from .downloader import (
    AbstractDownloader,
    DownloadBuffer
)
from .. import mongo


class GearDownloader(AbstractDownloader):
    def __init__(self, config):
        super().__init__(config)
        self.api = None

    def download(self):
        if self.progress.running:
            return

        def buffer_cb(gears):
            return db.gear.insert_many(gears)

        download_buffer = DownloadBuffer(self.config["server"]["max_download_buffer"], buffer_cb)

        self.connect_if_required()
        db = mongo.factory.default_client()

        # Get unique gear IDs from activities db
        activity_gear_ids = db.activities.distinct("gear.id")
        stored_gear_ids = list(db.gear.distinct("id"))

        ids_to_download = [a for a in activity_gear_ids if a not in stored_gear_ids]
        downloaded_gear = []

        self.progress.set_num(len(ids_to_download))
        self.progress.start()
        try:
            for g in progressbar.progressbar(ids_to_download):
                api_response = self.api.get_gear_by_id(g)
                d = api_response.to_dict()
                d = stravaio.convert_datetime_to_iso8601(d)
                download_buffer.add(d)
                downloaded_gear.append(g)

        finally:
            if len(download_buffer) > 0:
                download_buffer.flush()
            self.progress.end()

        return downloaded_gear

    def connect_if_required(self):
        super().connect_if_required()
        if self.api is None:
            self.api = stravaio.swagger_client.GearsApi(self.client._api_client)

    def clear(self):
        pass
