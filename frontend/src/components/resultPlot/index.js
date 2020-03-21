import React, {useState} from "react";
import Plot from 'react-plotly.js';
import {useSelector} from "react-redux";
import {selectActivities} from "../search/searchApiSlice";
import {getComparator, stableSort} from "../../utils/sort"
import {speedToPaceMS} from "../../utils/ui";
import config from "../../app/config/config";
import {selectFormState} from "../search/searchUiSlice";

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

    const plotGridColor = "#333333";
    const plotBackgroundColor = "#292929";
    const [state, setState] = useState({
            layout: {
                autosize: true,
                responsize: true,
                yaxis: {
                    gridcolor: plotGridColor,
                    zerolinecolor: plotGridColor,
                    linecolor: plotGridColor,
                    tickformat: "%M:%S"
                },
                xaxis: {
                    gridcolor: plotGridColor,
                    zerolinecolor: plotGridColor,
                    linecolor: plotGridColor,
                    tickformat: "%Y-%m-%d"
                },
                plot_bgcolor: plotBackgroundColor,
                paper_bgcolor: plotBackgroundColor
            },
            frames: [],
            config: {}
        }
    );

    const getLayoutWithTitle = (v) => ({
        ...state.layout,
        title: `Pace (mins/km) over time ${distanceFormat(v.low)}km ... ${distanceFormat(v.high)}km`
    });

    return (
        <div style={{width: '100%'}}>
            <Plot
                useResizeHandler
                style={{height: '100%', width: '100%'}}
                data={[createData(activities)]}
                layout={getLayoutWithTitle(searchState.values)}
                frames={state.frames}
                config={state.config}
                onInitialized={(figure) => setState(figure)}
                // TODO: Uncommenting the below creates a render loop but the docs suggest this is done.
                // Need to work out what I've done wrong.
                // onUpdate={(figure) => setState(figure)}
            />
        </div>
    );
}