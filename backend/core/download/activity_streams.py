import progressbar
from swagger_client.rest import ApiException

from backend.core import mongo
from backend.core.download.downloader import AbstractDownloader, DownloadBuffer
from backend.models.stream_model import ActivityStreamModel


class ActivityStreamDownloader(AbstractDownloader):
    def __init__(self, config):
        super().__init__(config)
        self._activity_id = None

    def download(self):
        if self.progress.running:
            return

        self.connect_if_required()
        db = mongo.factory.default_client()

        def buffer_cb(stream_docs):
            return db.streams.insert_many(stream_docs)

        download_buffer = DownloadBuffer(self.config["server"]["max_download_buffer"], buffer_cb)

        # Find all activities for which we haven't downloaded the streams
        stream_ids = list(db.activities.aggregate([
            {
                '$lookup': {
                    'from': 'streams',
                    'localField': 'id',
                    'foreignField': 'activity_id',
                    'as': 'refs'
                }
            }, {
                '$project': {
                    'id': 1,
                    'num_refs': {
                        '$size': '$refs'
                    }
                }
            }, {
                '$match': {
                    'num_refs': 0
                }
            }, {
                '$project': {
                    'id': 1
                }
            }
        ]))

        self.progress.set_num(len(stream_ids))
        self.progress.start()
        downloaded_streams = []
        try:
            for a in progressbar.progressbar(stream_ids):
                self.progress.log(f"Downloading stream for activity {a['id']}")
                try:
                    streams_data = self.client.get_activity_streams(a['id'], self.athlete_id)
                    stream_model = ActivityStreamModel.doc_from_strava(a['id'], streams_data)
                    stream_model = self.apply_transforms(stream_model)
                    downloaded_streams.append({**stream_model})
                    download_buffer.add(stream_model)
                    self.progress.next()
                except ApiException as err:
                    if err.status == 404:
                        self.progress.log(f"No streams available for activity {a['id']}")
                        stream_model = ActivityStreamModel.empty_doc(a['id'])
                        download_buffer.add(stream_model)
                        continue
                    raise err
        finally:
            if len(download_buffer) > 0:
                download_buffer.flush()
            self.progress.end()

        return downloaded_streams

    def clear(self):
        db = mongo.factory.default_client()
        db.streams.remove({})
