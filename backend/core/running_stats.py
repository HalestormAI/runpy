import json
import logging
from collections import Iterable

import numpy as np
import pandas as pd
from bson import json_util

from . import mongo
from .connection import StravaConnectedObject

logger = logging.getLogger("runpy")


class StatHandlers(object):
    _handlers = {}

    @staticmethod
    def register_handler(name, handler):
        logging.debug(f"Registering activity search handler: {name}")
        StatHandlers._handlers[name] = handler

    @staticmethod
    def get(name):
        if name not in StatHandlers._handlers:
            raise RuntimeError(f"Stat handler not registered: {name}")
        return StatHandlers._handlers[name]

    @staticmethod
    def list():
        return StatHandlers._handlers.keys()


class StatHandler(StravaConnectedObject):

    def __init__(self, handler_name, config=None):
        super().__init__(config)
        StatHandlers.register_handler(handler_name, self)

    def mongo_client(self):
        return mongo.factory.default_client()

    def get_activities(self, **kwargs):
        raise NotImplementedError("The get_activities method should be overriden")

    @staticmethod
    def parse_result(result):
        return json.loads(json_util.dumps(result))


class ActivitiesForDistance(StatHandler):

    def __init__(self, config=None):
        super().__init__("distance_range", config)

    def get_activities(self, lower_bound, upper_bound, type="Run", ignore_manual=True):
        db = self.mongo_client()
        query = {
            "distance": {
                "$gte": lower_bound,
                "$lte": upper_bound
            },
            "type": type
        }
        if ignore_manual:
            query["manual"] = False
        return StatHandler.parse_result(db.activities.find(query))


class ActivitiesForMargin(StatHandler):

    def __init__(self, config=None):
        super().__init__("distance_margin", config)

    # TODO: Refactor this to reuse code w/ distance handler
    def get_activities(self, target_distance, margin=0.1, type="Run", ignore_manual=True):
        lower_bound = target_distance - margin * target_distance
        upper_bound = target_distance + margin * target_distance

        db = self.mongo_client()
        query = {
            "distance": {
                "$gte": lower_bound,
                "$lte": upper_bound
            },
            "type": type
        }
        if ignore_manual:
            query["manual"] = False
        return StatHandler.parse_result(db.activities.find(query))


class ActivitiesForName(StatHandler):

    def __init__(self, config=None):
        super().__init__("name", config)

    def get_activities(self, name, type='Run', ignore_manual=True):
        import re
        db = self.mongo_client()
        query = {
            'name': re.compile('^' + name + '$', re.IGNORECASE),
            "type": type
        }
        return StatHandler.parse_result(db.activities.find(query))


class WindowedActivityPace(StatHandler):

    def __init__(self, config=None):
        super().__init__("windowedActivityPace", config)

    def get_activities(self, type='Run', ignore_manual=True):
        db = self.mongo_client()
        query = {
            "type": type
        }
        db_result = db.activities.find(query, {
            'start_date': 1,
            'average_speed': 1,
            "distance": 1,
            "total_elevation_gain": 1
        }

                                       )
        results = StatHandler.parse_result(db_result)

        sorted_results = sorted(results, key=lambda x: x["start_date"])
        df = pd.DataFrame(sorted_results)
        df["start_date"] = pd.to_datetime(df["start_date"], infer_datetime_format=True)

        df = df.set_index("start_date")

        data_cols = [c for c in df.columns if c != "_id"]
        df = df[data_cols]

        aggregation_spec = {k: [np.mean, np.min, np.max] for k in df.columns}
        agg = df.groupby(pd.Grouper(freq="M")).aggregate(aggregation_spec)
        agg["distance"] = agg["distance"].fillna(0)

        def safeNan(i):
            if isinstance(i, Iterable):
                return [safeNan(j) for j in i]
            if np.isnan(i):
                return None
            return i

        # The dict is non-serializable for a few reasons, we'll have to fix that manually:
        # (1) Top-level keys are tuples, break into 2 levels
        # (2) Due to Timestamp objects as keys in child dicts -> fix to strings
        # (3) NaN is not a valid type for JSON and cannot be deserialised at the other end
        output = {}
        for col in data_cols:
            # Format the df as {TS(date): {mean: m, std: s}}
            col_data = agg[col].to_dict(orient="index")

            # Clean for JSON and remove inner dict
            # {str(date): [m, s]}
            output[col] = {str(k): safeNan(v.values()) for k, v in col_data.items()}

        return output


def register_handlers():
    handlers = [ActivitiesForDistance, ActivitiesForMargin, ActivitiesForName, WindowedActivityPace]
    for handler in handlers:
        handler()
