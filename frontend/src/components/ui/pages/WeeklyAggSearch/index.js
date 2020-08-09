import {useDispatch, useSelector} from "react-redux";
import React, {useEffect, useState} from "react";
import Grid from "@material-ui/core/Grid";
import {loadResult, selectResult, selectWeekDetails, updateSelectedWeek} from './weeklyAggSlice'
import Plot from "react-plotly.js";
import {useTheme} from "@material-ui/core/styles";
import {defaultPlotLayout, initialPlotState} from "../../../../utils/plot";
import {secondsToHMS, speedToPaceMS} from "../../../../utils/ui";
import LoadingSpinner from "../../loadingSpinner";
import Link from "@material-ui/core/Link";
import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";
import TableHead from "@material-ui/core/TableHead";
import TableContainer from "@material-ui/core/TableContainer";
import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import {getComparator, stableSort} from "../../../../utils/sort";
import config from "../../../../app/config/config";

// TODO: Extract similarities between plots
function TemporalPlot(props) {
    const {data, title, primaryColour, secondaryColor, yaxis, clickHandler} = props;
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

    const x_data = data.map(x => x["date"])
    const y_data = data.map(x => x["count"] / 1000)

    const traces = [{
        x: x_data,
        y: y_data,
        line: {color: primaryColour},
        mode: 'lines',
        name: "Distance",
        fill: 'tozeroy',
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


function WeekDetails(props) {
    const {data, week} = props;
    const weekInfo = data.filter(x => x.date === week)[0];

    const comparator = getComparator("ASC", "date");

    const stravaUrl = id => `https://www.strava.com/activities/${id}`;

    const totalTime = weekInfo.runs.reduce((accl, run) => (
        accl + run.time
    ), 0);

    const totalDistance = weekInfo.runs.reduce((accl, run) => (
        accl + run.distance
    ), 0);

    return (<React.Fragment>
        <h3>Running data for W/C: {week}</h3>
        <h5>Total Distance: {(totalDistance / 1000).toFixed(2)}km</h5>
        <h5>Total Time: {secondsToHMS(totalTime)}</h5>
        <TableContainer component={Paper}>
            <Table aria-label="simple table">
                <TableHead>
                    <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell align="right">Distance</TableCell>
                        <TableCell align="right">Moving Time</TableCell>
                        <TableCell align="right">Elevation</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {stableSort(weekInfo.runs, comparator).map((row, index) => (
                        <TableRow key={`${row.name}_${index}`}>
                            <TableCell>
                                {new Date(row.date).toLocaleDateString(config.locale)}
                            </TableCell>
                            <TableCell>
                                <Link href={stravaUrl(row.id)} color="secondary">{row.name}</Link>
                            </TableCell>
                            <TableCell align="right">
                                {(row.distance / 1000).toFixed(2)}km
                            </TableCell>
                            <TableCell align="right">
                                {secondsToHMS(row.time)}
                            </TableCell>
                            <TableCell align="right">
                                {row.elevation.toFixed(2)}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    </React.Fragment>)
}


export default function WeeklyAggregationStatsPage(props) {
    const stats = useSelector(selectResult);
    const selectedWeek = useSelector(selectWeekDetails)
    const dispatch = useDispatch();

    const hasStats = stats !== null && stats.constructor === Array && stats.length !== 0;

    useEffect(() => {
        if (!hasStats) {
            dispatch(loadResult())
        }
    }, [hasStats, dispatch]);

    const selectWeek = (clickData) => {
        if (clickData.points.length < 1)
            return
        const week = clickData.points[0].x;
        dispatch(updateSelectedWeek(week));
    };

    console.log(selectedWeek)
    return (
        <Grid container>
            {hasStats ? (
                    <React.Fragment>
                        <Grid item xs={12}>
                            <TemporalPlot
                                data={stats}
                                title="Weekly Distance"
                                clickHandler={selectWeek}
                            />
                        </Grid>
                        {selectedWeek !== null ? (
                                <Grid item xs={12}>
                                    <WeekDetails data={stats} week={selectedWeek}/>
                                </Grid>) :
                            <p>Click a data-point to see run information for that week.</p>}
                    </React.Fragment>
                ) :
                <Grid item xs={12}>
                    <LoadingSpinner/>
                </Grid>
            }
        </Grid>
    )
};