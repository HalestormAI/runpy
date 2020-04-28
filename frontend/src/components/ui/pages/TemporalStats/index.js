import {useDispatch, useSelector} from "react-redux";
import React, {useState} from "react";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import CachedIcon from '@material-ui/icons/Cached';
import CircularProgress from "@material-ui/core/CircularProgress";
import makeStyles from "@material-ui/core/styles/makeStyles";
import {grey} from "@material-ui/core/colors";
import {loadStats, selectActivities, selectApiState} from './temporalStatsSlice'
import Plot from "react-plotly.js";
import {useTheme} from "@material-ui/core/styles";
import {defaultPlotLayout, initialPlotState} from "../../../../utils/plot";
import {speedToPaceMS} from "../../../../utils/ui";

const useStyles = makeStyles(theme => ({
    buttonProgress: {
        color: grey[500],
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: -12,
        marginLeft: -12,
    }
}));

// TODO: Extract similarities between plots
function ErrorBarTemporalPlot(props) {
    const {data, title, primaryColour, secondaryColor, yaxis} = props;
    const theme = useTheme();

    const layoutMemo = React.useMemo(
        () => {
            const layout = defaultPlotLayout(theme, title);
            layout.yaxis.tickformat = yaxis;
            layout.xaxis.tickformat = "%Y-%m-%d";
            return layout;
        }, [theme.palette]
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

    // Dates: data keys
    const x_data = Object.keys(data);
    const y_mean = Object.values(data).map(x => x[0]);
    // const y_std_low = Object.values(data).map(x => x[0] - x[1]);

    // // If mean is null, upperbound should be null
    // // If not, but stddev is null, upperbound should == mean
    // // Otherwise upperbound = mean + stddev
    // const std_val = x => {
    //     if (x[0] === null) {
    //         return null;
    //     }
    //     if (x[1] === null) {
    //         return x[0];
    //     }
    //     return x[0] + x[1];
    // };
    // const y_std_high = Object.values(data).map(std_val);
    const y_high = Object.values(data).map(x => x[2]);
    const y_low = Object.values(data).map(x => x[1]);

    const mean_data = {
        x: x_data,
        y: y_mean,
        line: {color: primaryColour},
        mode: 'lines+markers',
        name: "Mean",
        type: "scatter",
        connectgaps: true
    };

    const bound_high = {
        x: x_data,
        y: y_high,
        fill: "tonexty",
        fillcolor: secondaryColor,
        line: {color: "#efefef"},
        name: "UpperBound",
        showlegend: false,
        type: "scatter",
        connectgaps: true
    };

    const bound_low = {
        x: x_data,
        y: y_low,
        line: {color: "#efefef"},
        mode: "lines",
        name: "Lowerbound",
        showlegend: false,
        type: "scatter",
        connectgaps: true
    };

    return (
        <div style={{width: '100%'}}>
            <Plot
                useResizeHandler
                style={{height: '100%', width: '100%'}}
                data={[bound_low, bound_high, mean_data]}
                layout={state.layout}
                onInitialized={(figure) => setState(figure)}
                onUpdate={(figure) => updateState(figure)}
            />
        </div>
    );
}


export default function TemporalStatsPage(props) {
    const stats = useSelector(selectActivities);
    const apiState = useSelector(selectApiState);

    const dispatch = useDispatch();

    const classes = useStyles();

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
            <Grid item xs={12}>
                <Button onClick={() => dispatch(loadStats())}
                        endIcon={<CachedIcon/>}
                        disabled={apiState.waiting}>Update</Button>
                {apiState.waiting && <CircularProgress size={24} className={classes.buttonProgress} color="primary"/>}
            </Grid>
            {(Object.keys(stats).length !== 0 && stats.constructor === Object) && (
                <React.Fragment>
                    <Grid item xs={12}>
                        <ErrorBarTemporalPlot data={distanceToKm(stats.distance)} title="Distance Per Run"
                                              primaryColour="rgb(0,100,80)"
                                              secondaryColor="rgba(0,100,80,0.2)" yaxis="m"/>
                    </Grid>
                    <Grid item xs={12}>
                        <ErrorBarTemporalPlot data={paceFromSpeed(stats.average_speed)} title="Average Pace"
                                              primaryColour="rgb(0,176,246)" secondaryColor="rgba(0,176,246,0.2)"
                                              yaxis="%M:%S"/>
                    </Grid>
                    <Grid item xs={12}>
                        <ErrorBarTemporalPlot data={stats.total_elevation_gain} title="Total Elevation"
                                              primaryColour="rgb(231,107,243)" secondaryColor="rgba(231,107,243,0.2)"
                                              yaxis="m"/>
                    </Grid>
                </React.Fragment>
            )}
        </React.Fragment>
    )
};