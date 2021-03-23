import React from "react";
import {secondsToHMS} from "../../../utils/ui";
import Link from "@material-ui/core/Link";
import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";
import TableHead from "@material-ui/core/TableHead";
import TableContainer from "@material-ui/core/TableContainer";
import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import {getComparator, stableSort} from "../../../utils/sort";
import config from "../../../app/config/config";

export default function WeekDetails(props) {
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