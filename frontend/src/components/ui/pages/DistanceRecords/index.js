import {useDispatch, useSelector} from "react-redux";
import React, {useEffect, useState} from "react";
import Grid from "@material-ui/core/Grid";
import {loadResult, selectResult, selectWeekDetails, updateSelectedWeek} from './distanceRecordSlice'
import Plot from "react-plotly.js";
import {useTheme} from "@material-ui/core/styles";
import {defaultPlotLayout, initialPlotState} from "../../../../utils/plot";
import {secondsToHMS} from "../../../../utils/ui";
import LoadingSpinner from "../../loadingSpinner";


const ONE_WEEK = 60 * 60 * 24 * 7 * 1000;

// Monthly average
function rollingAverage(data, inputDate, windowSize = 5) {
    const dateIds = []

    if (windowSize % 2 !== 1) {
        windowSize += 1;
    }

    for (let i = -(windowSize - 1) / 2; i <= (windowSize - 1) / 2; i++) {
        const dt = new Date(new Date(inputDate) - ONE_WEEK * i);
        dateIds.push(dt.toISOString().split("T")[0].slice(0, -3))
    }

    const x = data.filter(x => dateIds.includes(x.date.split("T")[0].slice(0, -3)));
    return x.reduce((accl, item) => accl + item.record, 0) / x.length;
}

// TODO: Extract similarities between plots
function TemporalPlot(props) {
    const {data, title, primaryColour, secondaryColor, yaxis, clickHandler} = props;
    const theme = useTheme();

    const layoutMemo = React.useMemo(
        () => {
            const layout = defaultPlotLayout(theme, title);
            layout.yaxis.tickformat = "%H:%M:%S";
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

    const x_data = data.map(x => x.date)
    const y_data = data
        .map(x => x["record"])
        .map(a => "2020-01-01 " + secondsToHMS(a));

    const averages = data
        .map(x => rollingAverage(data, x.date.split("T")[0].slice(0, -3), 5))
        .map(a => "2020-01-01 " + secondsToHMS(a));

    const traces = [{
        x: x_data,
        y: y_data,
        line: {color: primaryColour},
        mode: 'lines',
        name: "Distance",
        fill: 'tozeroy',
        type: "scatter",
        connectgaps: false
    },
        {
            x: x_data,
            y: averages,
            line: {color: secondaryColor},
            mode: 'lines',
            name: "RollingAverage",
            type: "scatter",
            connectgaps: false
        }]

    return (
        <div style={{width: '100%'}}>
            <Plot
                useResizeHandler
                style={{height: '100%', width: '100%'}}
                data={traces}
                layout={state.layout}
                onInitialized={(figure) => setState(figure)}
                onUpdate={(figure) => updateState(figure)}
                onClick={(e) => clickHandler(e)}
            />
        </div>
    );
}


export default function DistanceRecordPage(props) {
    const {distance} = props;
    const stats = useSelector(selectResult);
    const selectedWeek = useSelector(selectWeekDetails)
    const dispatch = useDispatch();
    const hasStats = stats !== null && stats.constructor === Object && stats[distance] !== undefined && stats[distance].length !== 0;

    useEffect(() => {
        if (!hasStats) {
            dispatch(loadResult(distance))
        }
    }, [hasStats, dispatch]);

    const selectWeek = (clickData) => {
        if (clickData.points.length < 1)
            return
        const week = clickData.points[0].x;
        dispatch(updateSelectedWeek(week));
    };

    const distanceKm = Math.round(distance / 1000);
    const title = `Distance Records: ${distanceKm}km`;
    return (
        <Grid container>
            {hasStats ? (
                    <React.Fragment>
                        <Grid item xs={12}>
                            <TemporalPlot
                                data={stats[distance]}
                                title={title}
                                // clickHandler={selectWeek}
                            />
                        </Grid>
                    </React.Fragment>
                ) :
                <Grid item xs={12}>
                    <LoadingSpinner/>
                </Grid>
            }
        </Grid>
    )
};