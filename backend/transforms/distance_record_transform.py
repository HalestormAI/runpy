import numpy as np

import backend.transforms.activity_transform as transform
from backend.core.config import Config
from backend.core.utils import merge_dicts
from backend.models.stream_model import ActivityStreamModel


def _find_distance_end_for_start(distances, i, target):
    if i + 1 >= len(distances):
        return None

    diff_from_tgt = (distances[i + 1:] - distances[i]) - target

    # Keep invalid values to retain index count but set them high
    diff_from_tgt[diff_from_tgt < 0] = np.inf
    idx = np.argmin(diff_from_tgt)
    # If this is inf, we couldn't find a suitable endpoint
    return None if diff_from_tgt[idx] == np.inf else idx + i


def _total_time_for_start(data, i, target):
    distances = [0.0] + data["distance"]
    times = [0.0] + data["time"]
    end = _find_distance_end_for_start(np.array(distances), i, target)
    if end is None:
        return None
    return times[end] - times[i]


class DistanceRecordTransform(transform.ActivityTransform):
    """
    Find the fastest distance within each run. (E.g. fastest 5km out of a 10km run).
    """

    def __init__(self, params):
        super().__init__(params)
        self.model_factory = ActivityStreamModel(Config.get_instance())
        if "distance" not in self.params:
            raise AttributeError("The `distance` parameter must be supplied in params.")

    def run_on_existing(self, activity_id, commit=False):
        """
        Run the transform against a specific activity
        :param activity_id: The ID of the activity from Strava
        :param commit: Stores the single updated object immediately. Otherwise will wait until self.commit() is called.
        :return: The transformed stream object
        """
        # Get the original document for the activity id
        stream = self.model_factory.get(activity_id)

        # Apply the transformation on the given stream item
        transformed = self.apply(stream)
        if transformed is None:
            return stream

        # Line it up for commmitting and commit instantly if the arg is set.
        self._add_transformed(activity_id, transformed)
        if commit:
            self.commit()

        return transformed

    def apply(self, model):
        stream_data = model["data"]

        # Bad run - no stream recorded
        if "distance" not in stream_data or len(stream_data["distance"]) == 0:
            return None

        # Run is shorter than target
        run_distance = np.max(stream_data["distance"])
        if run_distance < self.params["distance"]:
            return None

        num_points = len(stream_data["distance"])
        times = [_total_time_for_start(stream_data, i, self.params["distance"]) for i in range(num_points)]

        all_times = [t for t in times if t is not None]
        best_result = np.min(all_times)
        return self._add_update_record(model, best_result)

    def _add_update_record(self, model, record):
        # TODO: Make this more general so it can go in the parent class
        pieces = self.db_path.split('.')
        dist_dict = {
            pieces[1]: {
                pieces[2]: record
            }
        }
        if pieces[0] in model:
            model[pieces[0]] = dict(merge_dicts(model[pieces[0]], dist_dict))
        else:
            model[pieces[0]] = dist_dict
        return model

    def commit(self):
        if len(self._transformed) == 0:
            return
        if self._committing:
            raise RuntimeError("Already commiting, cannot run again until the previous batch has been completed.")
        try:
            self._committing = True
            self.model_factory.update_many(self._transformed)
            self._transformed.clear()
        finally:
            self._committing = False

    @property
    def db_path(self):
        return f"transforms.distance_record.{self.params['distance']}"


def register(d):
    transform.register(ActivityStreamModel, DistanceRecordTransform({"distance": d}))
