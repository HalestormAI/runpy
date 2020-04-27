import React, {useState} from "react";
import Plot from 'react-plotly.js';
import {useSelector} from "react-redux";
import {selectActivities} from "../search/searchApiSlice";
import {getComparator, stableSort} from "../../utils/sort"
import {speedToPaceMS} from "../../utils/ui";
import config from "../../app/config/config";
import {selectFormState} from "../search/searchUiSlice";
import {useTheme} from '@material-ui/core/styles';

function distanceFormat(distance) {
    return (distance / 1000).toFixed(2);
}

function createData(activities) {
    const workoutTypes = ["Run", "Race"];
    const sorted = stableSort(activities, getComparator("asc", "start_date"));
    const raceGroups = activities
        .map(a => a.workout_type === null ? 0 : a.workout_type)
        .map(a => workoutTypes[a]);

    const dateFormat = dateStr => new Date(dateStr).toLocaleDateString(config.locale);

    return {
        x: sorted.map(a => a.start_date),
        y: sorted.map(a => "2020-01-01 00:" + speedToPaceMS(a.average_speed)),
        text: sorted.map(a => `[${dateFormat(a.start_date)}] ${a.name} (${distanceFormat(a.distance)}km)`),
        type: 'scatter',
        mode: 'markers',
        // marker: {color: 'red'}
        transforms: [{
            type: "groupby",
            groups: raceGroups
        }]
    }
}

export default function SearchResultPlotComponent() {
    const searchState = useSelector(selectFormState);
    const activities = useSelector(selectActivities);
    const theme = useTheme();

    const layoutMemo = React.useMemo(
        () => {
            return ({
                autosize: true,
                responsize: true,
                yaxis: {
                    gridcolor: theme.palette.background.default,
                    zerolinecolor: theme.palette.background.default,
                    linecolor: theme.palette.background.default,
                    tickformat: "%M:%S"
                },
                xaxis: {
                    gridcolor: theme.palette.background.default,
                    zerolinecolor: theme.palette.background.default,
                    linecolor: theme.palette.background.default,
                    tickformat: "%Y-%m-%d"
                },
                plot_bgcolor: theme.palette.background.paper,
                paper_bgcolor: theme.palette.background.paper,
                title: `Pace (mins/km) over time ${distanceFormat(searchState.values.low)}km ... ${distanceFormat(searchState.values.high)}km`,
                font: {
                    color: theme.palette.text.primary
                }
            })
        }, [theme.palette, searchState.values]
    );

    const initialState = {
        layout: {...layoutMemo},
        frames: [],
        config: {}
    };

    const [state, setState] = useState(initialState);

    const wouldUpdate = (fig) => {
        state.layout = {
            ...fig.layout,
            ...layoutMemo,
        };
        state.config = {...fig.config};
        state.frames = {...fig.frames};
        setState(state);
        console.log("Setting state: ", state);
    };

    return (
        <div style={{width: '100%'}}>
            <Plot
                useResizeHandler
                style={{height: '100%', width: '100%'}}
                data={[createData(activities)]}
                layout={state.layout}
                onInitialized={(figure) => setState(figure)}
                onUpdate={(figure) => wouldUpdate(figure)}
            />
        </div>
    );
};