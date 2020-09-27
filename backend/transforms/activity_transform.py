from collections import defaultdict

_registered_transforms = defaultdict(list)


class ActivityTransform(object):
    def __init__(self, params=None):
        self.params = params
        self._transformed = {}
        self._committing = False

    def __eq__(self, b):
        return type(self) == type(b) and self.params == b.params

    def run_on_existing(self, *args, **kwargs):
        """Carry out a transform on an existing item in the database. Should offer the opportunity for the user
        to commit as the transform is run, or to build a batch for use with the commit() method."""
        raise NotImplementedError(
            "The run_on_existing method is abstracts and should be overriden by the concrete Transform")

    def apply(self, model):
        """Transform a single piece of data, out-of-place. Returns the transformed item. Doesn't handle
        R/W from/to storage """
        raise NotImplementedError(
            "The transform method is abstracts and should be overriden by the concrete Transform")

    def _add_update_record(self, *args, **kwargs):
        """Embed the transformed data into the original item. Typically should store in the following rough path:
        item["transforms"]["<transform_name>"] = {...}."""
        raise NotImplementedError(
            "The _add_update_record method is abstract and should be overriden by the concrete Transform")

    def _try_get_record(self, model, default=None):
        """Retrieve the transformed record from an item of data using the same path as above, nominally:
        item["transforms"]["<transform_name>"]
        """
        try:
            pieces = self.db_path.split('.')
            ptr = model
            for p in pieces:
                ptr = ptr[p]
            return ptr
        except KeyError:
            return default

    def _add_transformed(self, activity_id, transformed):
        self._transformed[activity_id] = transformed

    def commit(self, *args, **kwargs):
        """Commit a batch of cached documents back into the database. To be used with `run_on_existing`.
        Should use the `_transformed` dict (activity_id: doc) to build a batch update, then clear the dict once done.
        Should use the `_committing` flag to prevent concurrent commit calls from the same transform instance."""
        raise NotImplementedError(
            "The commit method is abstract and should be overriden by the concrete Transform")

    @property
    def db_path(self):
        raise NotImplementedError(
            "The db_path property is abstract and should be overriden by the concrete Transform")


def register(model_class, tform):
    if tform in _registered_transforms[model_class]:
        raise RuntimeError("Transform already registered.")
    _registered_transforms[model_class].append(tform)


def get_transforms(model_class):
    return _registered_transforms.get(model_class)
