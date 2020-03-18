import json
import logging

from bson import json_util

from . import mongo
from .connection import StravaConnectedObject

# import plotly.express as px
#
# import plotly.graph_objs as go
# from ipywidgets import Output, VBox
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

    #     activity_date_speeds = [(a['start_date_local'], a['average_speed'], a['name'], a['distance']/1000) for a in activities]
    #
    #     df = pd.DataFrame(activity_date_speeds, columns=('date', 'speed', 'name', 'distance'))
    #
    #     # Speed is in m/s, pace is in min/km
    #     df['pace'] = 1000 / df['speed'] / 60
    #     df['date'] = pd.to_datetime(df['date'])
    #     df.sort_values('date', inplace=True)
    #     # df.set_index(['date'], inplace=True)
    #
    #     df['date_formatted_pace'] = self._format_pace_for_plotly(df['pace'])
    #     fig = px.scatter(df, x='date', y='date_formatted_pace', hover_data=['name', 'distance'], title=f'{int(target_distance/1000)}km Running Pace (+/- {target_distance*margin/1000:.2f}km)')
    #     fig.update_layout(
    #         yaxis_tickformat='%M:%S'
    #     )
    #
    #     scatter = fig.data[0]
    #     scatter.on_click(self._go_to_activity)
    #
    #     fig.show()
    #
    #     # df['pace'].plot(style="o")
    #     # plt.title(f"Average pace for ~{int(target_distance / 1000)}km runs over time")
    #     # plt.xlabel("Date")
    #     # plt.ylabel("Pace (mins/km)")
    #     # plt.show()
    #     print(activities[0])
    #
    # def _format_pace_for_plotly(self, pace_df):
    #     # Plotly needs a full datetime to understand it as a date
    #     float_to_pace = lambda x:  f"1970-1-1 00:{int(x):02}:{int(x * 60 - int(x) * 60):02}"
    #     return pace_df.apply(float_to_pace)
    #
    # def _go_to_activity(self, trace, points, selector):
    #     print(trace)
    #     pass


def register_handlers():
    handlers = [ActivitiesForDistance, ActivitiesForMargin, ActivitiesForName]
    for handler in handlers:
        handler()

#
# if __name__ == "__main__":
#     config = Config('config.json')
#     rs = RunningStatHandler(config)
#     rs.connect(validate_token=False)
#     # rs.find_activities_for_distance(10000, ignore_manual=True)
#     # rs.find_activities_for_distance(5000, ignore_manual=True)
#     rs.find_activities_for_distance(7500, margin=2, ignore_manual=True)
#     # rs.find_activities_for_distance(21000, ignore_manual=True)
