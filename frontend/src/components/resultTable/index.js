import {useSelector} from "react-redux";
import {selectActivities} from "../search/searchApiSlice";
import React from "react";
import TableContainer from "@material-ui/core/TableContainer";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";
import TableBody from "@material-ui/core/TableBody";
import Paper from '@material-ui/core/Paper';

export default function SearchResultTableComponent() {
    const activities = useSelector(selectActivities);

    const stravaUrl = id => `https://www.strava.com/activities/${id}`;
    console.log(activities);

    // TODO: This table will need a lot of work - this is just to check we can get the data in.
    return (
        <React.Fragment>
            {activities.length > 0 &&
            <TableContainer component={Paper}>
                <Table aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell align="centre">Type</TableCell>
                            <TableCell align="right">Date</TableCell>
                            <TableCell align="right">Distance (km)</TableCell>
                            <TableCell align="right">Elevation (m)</TableCell>
                            <TableCell align="right">Move Time</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {activities.map(row => (
                            <TableRow key={row.name}>
                                <TableCell component="th" scope="row">
                                    <a href={stravaUrl(row.id)}>{row.name}</a>
                                </TableCell>
                                <TableCell align="right">{row.type}</TableCell>
                                <TableCell align="right">{row.start_date}</TableCell>
                                <TableCell align="right">{row.distance / 1000}</TableCell>
                                <TableCell align="right">{row.total_elevation_gain}</TableCell>
                                <TableCell align="right">{row.moving_time / 60}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            }
        </React.Fragment>
    )
}
