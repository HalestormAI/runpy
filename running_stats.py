from core.connection import StravaConnectedObject
# import plotly.express as px
#
# import plotly.graph_objs as go
# from ipywidgets import Output, VBox

import logging
logger = logging.getLogger()


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

    def get_activities(self, **kwargs):
        raise NotImplementedError("The get_activities method should be overriden")


class ActivitiesForDistance(StatHandler):

    def __init__(self, config=None):
        super().__init__("distance_range", config)

    def get_activities(self, lower_bound, upper_bound, type="Run", ignore_manual=True):
        if self.client is None:
            self.connect()

        def valid_distance(activity):
            distance = activity['distance']
            correct_distance = lower_bound <= distance <= upper_bound

            if ignore_manual:
                correct_manual = activity['manual'] is False
                return correct_distance and correct_manual
            return correct_distance

        activities = list(self.client.local_activities(self.athlete_id))
        return [a for a in activities if valid_distance(a) and a['type'] == type]


class ActivitiesForMargin(StatHandler):

    def __init__(self, config=None):
        super().__init__("distance_margin", config)

    def get_activities(self, target_distance, margin=0.1, type="Run", ignore_manual=True):
        if self.client is None:
            self.connect()

        def valid_distance(activity):
            distance = activity['distance']
            lower_bound = target_distance - margin * target_distance
            upper_bound = target_distance + margin * target_distance

            correct_distance = lower_bound <= distance <= upper_bound

            if ignore_manual:
                correct_manual = activity['manual'] is False
                return correct_distance and correct_manual
            return correct_distance

        activities = list(self.client.local_activities(self.athlete_id))
        return [a for a in activities if valid_distance(a) and a['type'] == type]


class ActivitiesForName(StatHandler):

    def __init__(self, config=None):
        super().__init__("name", config)

    def get_activities(self, name, type='Run', ignore_manual=True):
        if self.client is None:
            self.connect()

        activities = list(self.client.local_activities(self.athlete_id))
        # return activities
        # logging.debug(activities[0])
        return [a for a in activities if name.lower() in a['name'].lower() and a['type'] == type]

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
