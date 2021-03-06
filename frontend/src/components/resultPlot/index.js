import React, {useState} from "react";
import Plot from 'react-plotly.js';
import {useSelector} from "react-redux";
import {useTheme} from '@material-ui/core/styles';
import {selectFormState} from "../search/searchUiSlice";
import {selectActivities} from "../search/searchApiSlice";
import {getComparator, stableSort} from "../../utils/sort"
import {dateFormat, distanceFormat, speedToPaceMS} from "../../utils/ui";
import {defaultPlotLayout, initialPlotState} from "../../utils/plot";

export function formatActivityText(a) {
    return `[${dateFormat(a.start_date)}] ${a.name} (${distanceFormat(a.distance)}km)`;
}

export function createData(activities) {
    activities = activities.filter(a => a.average_speed > 0);
    const workoutTypes = ["Run", "Race", "Long Run", "Workout"];
    const sorted = stableSort(activities, getComparator("asc", "start_date"));
    const raceGroups = sorted
        .map(a => (a.workout_type === null || a.workout_type === undefined) ? 0 : a.workout_type)
        .map(a => workoutTypes[a]);

    return {
        x: sorted.map(a => a.start_date),
        y: sorted.map(a => "2020-01-01 00:" + speedToPaceMS(a.average_speed)),
        text: sorted.map(formatActivityText),
        type: 'scatter',
        mode: 'markers',
        transforms: [{
            type: "groupby",
            groups: raceGroups
        }]
    }
}

export const updatePlotState = (state, setState, fig, layoutMemo) => {
    state.layout = {
        ...state.layout,
        ...fig.layout,
        ...layoutMemo,
    };
    state.config = {...fig.config};
    state.frames = {...fig.frames};
    setState(state);
};

export default function SearchResultPlotComponent() {
    const searchState = useSelector(selectFormState);
    const activities = useSelector(selectActivities);
    const theme = useTheme();

    const layoutMemo = React.useMemo(
        () => {
            const title = `Pace (mins/km) over time ${distanceFormat(searchState.values.low)}km ... ${distanceFormat(searchState.values.high)}km`;
            const layout = defaultPlotLayout(theme, title);
            layout.yaxis.tickformat = "%M:%S";
            layout.xaxis.tickformat = "%Y-%m-%d";
            return layout;
        }, [theme, searchState.values]
    );

    const initialState = initialPlotState(layoutMemo);
    const [state, setState] = useState(initialState);

    return (
        <div style={{width: '100%'}}>
            <Plot
                useResizeHandler
                style={{height: '100%', width: '100%'}}
                data={[createData(activities)]}
                layout={state.layout}
                onInitialized={(figure) => setState(figure)}
                onUpdate={(figure) => updatePlotState(state, setState, figure, layoutMemo)}
            />
        </div>
    );
};