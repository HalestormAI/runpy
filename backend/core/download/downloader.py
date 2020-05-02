import logging
from ..config import Config
from ..connection import StravaConnectedObject

logger = logging.getLogger("runpy.downloader")

class DownloaderFactory():
    downloaders = {}

    @staticmethod
    def get(cls):
        if cls not in DownloaderFactory.downloaders:
            config = Config.get_instance()
            DownloaderFactory.downloaders[cls] = cls(config)
        return DownloaderFactory.downloaders[cls]


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

        for l in self._log:
            logger.info(l)

    @property
    def running(self):
        return self._running


class DownloadBuffer(object):
    def __init__(self, buffer_len, full_cb):
        self.buffer_len = buffer_len
        self.flush_callback = full_cb
        self.buffer = []

    def add(self, item):
        self.buffer.append(item)
        if len(self.buffer) > self.buffer_len:
            self.flush()

    def flush(self):
        self.flush_callback(self.buffer)
        self.buffer.clear()

    def __len__(self):
        return len(self.buffer)


class AbstractDownloader(StravaConnectedObject):
    def __init__(self, config):
        super().__init__(config)

        self.running = False
        self.progress = ProgressStatus()

    def download(self):
        raise NotImplementedError("Concrete downloader implementations should overload `download`")

    def clear(self):
        raise NotImplementedError("Concrete downloader implementations should overload `clear`")

    def connect_if_required(self):
        if self.client is None:
            self.connect()
