class ActivityModel(object):

    def __init__(self, activity_summary):
        self.summary = activity_summary

    @staticmethod
    def exists(collection, id):
        return collection.count_documents({"id": id}, limit=1) > 0
