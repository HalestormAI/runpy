import {useDispatch, useSelector} from "react-redux";
import React, {useEffect, useState} from "react";
import Grid from "@material-ui/core/Grid";
import CircularProgress from "@material-ui/core/CircularProgress";
import {loadStats, selectActivities, selectOptions, updateOptionState} from './temporalStatsSlice'
import Plot from "react-plotly.js";
import {useTheme} from "@material-ui/core/styles";
import {defaultPlotLayout, initialPlotState} from "../../../../utils/plot";
import {speedToPaceMS} from "../../../../utils/ui";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";

// TODO: Extract similarities between plots
function ErrorBarTemporalPlot(props) {
    const {data, title, primaryColour, secondaryColor, yaxis, options} = props;
    const theme = useTheme();

    const layoutMemo = React.useMemo(
        () => {
            const layout = defaultPlotLayout(theme, title);
            layout.yaxis.tickformat = yaxis;
            layout.xaxis.tickformat = "%Y-%m-%d";
            return layout;
        }, [theme, title, yaxis]
    );

    const initialState = initialPlotState(layoutMemo);
    const [state, setState] = useState(initialState);

    const updateState = (fig) => {
        state.layout = {
            ...fig.layout,
            ...layoutMemo,
        };
        state.config = {...fig.config};
        state.frames = {...fig.frames};
        setState(state);
    };

    const x_data = Object.keys(data);
    const y_mean = Object.values(data).map(x => x[0]);
    const y_high = Object.values(data).map(x => x[2]);
    const y_low = Object.values(data).map(x => x[1]);

    const bound_high = {
        x: x_data,
        y: y_high,
        fill: "tonexty",
        fillcolor: secondaryColor,
        line: {color: "#efefef"},
        name: "Max",
        showlegend: false,
        type: "scatter",
        connectgaps: true
    };

    const bound_low = {
        x: x_data,
        y: y_low,
        line: {color: "#efefef"},
        mode: "lines",
        name: "Min",
        showlegend: false,
        type: "scatter",
        connectgaps: true
    };

    const traces = [bound_low, bound_high];
    if (options.show_mean) {
        const mean_data = {
            x: x_data,
            y: y_mean,
            line: {color: primaryColour},
            mode: options.show_markers ? 'lines+markers' : 'lines',
            name: "Mean",
            type: "scatter",
            connectgaps: true
        };
        traces.push(mean_data);
    }
    return (
        <div style={{width: '100%'}}>
            <Plot
                useResizeHandler
                style={{height: '100%', width: '100%'}}
                data={traces}
                layout={state.layout}
                onInitialized={(figure) => setState(figure)}
                onUpdate={(figure) => updateState(figure)}
            />
        </div>
    );
}

function PlotOptions(props) {

    const {optionsUpdated} = props;
    const dispatch = useDispatch();
    const options = useSelector(selectOptions);
    const setFrequency = (event) => {
        const freq = event.target.checked ? "monthly" : "weekly";
        dispatch(updateOptionState({frequency: freq}));
        optionsUpdated();
    };

    return (
        <FormGroup row>
            <div>
                <label> Weekly </label>
                <FormControlLabel
                    control={<Switch checked={options.frequency === "monthly"}
                                     onChange={setFrequency}
                                     name="intersectionSwitch"
                                     color="default"/>}
                    label="Monthly"
                />
            </div>
        </FormGroup>
    )
}


export default function TemporalStatsPage(props) {
    const stats = useSelector(selectActivities);
    const options = useSelector(selectOptions);
    const dispatch = useDispatch();

    const hasStats = stats !== null && Object.keys(stats).length !== 0 && stats.constructor === Object;
    useEffect(() => {
        if (!hasStats) {
            dispatch(loadStats())
        }
    }, [hasStats, dispatch]);

    const optionsChanged = () => {
        dispatch(loadStats());
    };

    // Because pace is inverse speed, need to swap minmax
    const reorderPace = x => [x[0], x[2], x[1]];
    const accumulate_pace = (accl, spd) => ({
        ...accl,
        [spd[0]]: reorderPace(spd[1].map(s => "2020-01-01 00:" + speedToPaceMS(s)))
    });

    const accumulate_distance = (accl, d) => ({...accl, [d[0]]: d[1].map(z => z / 1000)});
    const paceFromSpeed = speeds => Object.entries(speeds).reduce(accumulate_pace, {});
    const distanceToKm = distances => Object.entries(distances).reduce(accumulate_distance, {});

    return (
        <React.Fragment>
            {hasStats ? (
                    <React.Fragment>
                        <Grid item xs={12}>
                            <PlotOptions optionsUpdated={optionsChanged}/>
                        </Grid>
                        <Grid item xs={12}>
                            <ErrorBarTemporalPlot data={distanceToKm(stats.distance)} title="Distance Per Run"
                                                  primaryColour="rgb(0,100,80)"
                                                  secondaryColor="rgba(0,100,80,0.2)"
                                                  yaxis="m" options={options}/>
                        </Grid>
                        <Grid item xs={12}>
                            <ErrorBarTemporalPlot data={paceFromSpeed(stats.average_speed)} title="Average Pace"
                                                  primaryColour="rgb(0,176,246)" secondaryColor="rgba(0,176,246,0.2)"
                                                  yaxis="%M:%S" options={options}/>
                        </Grid>
                        <Grid item xs={12}>
                            <ErrorBarTemporalPlot data={stats.total_elevation_gain} title="Total Elevation"
                                                  primaryColour="rgb(231,107,243)" secondaryColor="rgba(231,107,243,0.2)"
                                                  yaxis="m" options={options}/>
                        </Grid>
                    </React.Fragment>
                ) :
                <React.Fragment>
                    <CircularProgress/>
                </React.Fragment>}
        </React.Fragment>
    )
};