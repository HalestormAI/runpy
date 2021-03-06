import {useDispatch, useSelector} from "react-redux";
import {selectActivities} from "../search/searchApiSlice";
import React from "react";
import TableContainer from "@material-ui/core/TableContainer";
import Table from "@material-ui/core/Table";
import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";
import TableBody from "@material-ui/core/TableBody";
import Paper from '@material-ui/core/Paper';
import {selectTableState, setOrdering, setPage, setRowsPerPage} from "./resultTableSlice";
import TablePagination from "@material-ui/core/TablePagination";
import EnhancedTableHead from "./enhancedTableHead";
import config from "../../app/config/config";
import {secondsToHMS, speedToPaceMS} from "../../utils/ui";
import {getComparator, stableSort} from "../../utils/sort"
import Link from "@material-ui/core/Link";

export const headCells = [
    {id: 'type', numeric: false, disablePadding: false, label: 'Type'},
    {id: 'start_date', numeric: false, disablePadding: false, label: 'Date'},
    {id: 'name', numeric: false, disablePadding: false, label: 'Name'},
    {id: 'distance', numeric: true, disablePadding: false, label: 'Distance (km)'},
    {id: 'total_elevation_gain', numeric: true, disablePadding: false, label: 'Elevation (m)'},
    {id: 'pace', numeric: true, disablePadding: false, label: 'Pace (mins/km)'},
    {id: 'moving_time', numeric: true, disablePadding: false, label: 'Move Time'},
];

export default function SearchResultTableComponent() {
    let activities = useSelector(selectActivities);
    const tableState = useSelector(selectTableState);
    const dispatch = useDispatch();

    const stravaUrl = id => `https://www.strava.com/activities/${id}`;

    const handleChangePage = (event, newPage) => {
        dispatch(setPage(newPage));
    };

    const handleChangeRowsPerPage = event => {
        dispatch(setRowsPerPage(parseInt(event.target.value, 10)));
        dispatch(setPage(0));
    };

    const handleRequestSort = (event, property) => {
        const isAsc = tableState.ordering.orderBy === property && tableState.ordering.order === 'asc';
        dispatch(setOrdering({order: isAsc ? 'desc' : 'asc', orderBy: property}));
    };


    // TODO: This table will need a lot of work - this is just to check we can get the data in.
    const rowsPerPage = tableState.pagination.rowsPerPage;
    const page = tableState.pagination.page;
    const emptyRows = rowsPerPage - Math.min(rowsPerPage, activities.length - page * rowsPerPage);

    activities = activities.map((row, index) => ({
        ...row,
        pace: speedToPaceMS(row.average_speed)
    }));

    const comparator = getComparator(tableState.ordering.order, tableState.ordering.orderBy);
    const sortedActivities = stableSort(activities, comparator);

    return (
        <React.Fragment>
            <Paper>
                <TableContainer component={Paper}>
                    <Table aria-label="simple table">
                        <colgroup>
                            <col style={{width: '5%'}}/>
                            <col style={{width: '10%'}}/>
                            <col style={{width: '45%'}}/>
                            <col style={{width: '10%'}}/>
                            <col style={{width: '10%'}}/>
                            <col style={{width: '10%'}}/>
                            <col style={{width: '10%'}}/>
                        </colgroup>
                        <EnhancedTableHead
                            headCells={headCells}
                            order={tableState.ordering.order}
                            orderBy={tableState.ordering.orderBy}
                            onRequestSort={handleRequestSort}
                        />

                        <TableBody>
                            {sortedActivities
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((row, index) => (
                                    <TableRow key={`${row.name}_${index}`}>
                                        <TableCell align="left">{row.type}</TableCell>
                                        <TableCell align="left">
                                            {new Date(row.start_date).toLocaleDateString(config.locale)}
                                        </TableCell>
                                        <TableCell component="th" scope="row">
                                            <Link href={stravaUrl(row.id)} color="secondary">{row.name}</Link>
                                        </TableCell>
                                        <TableCell align="right">{(row.distance / 1000).toFixed(2)}</TableCell>
                                        <TableCell align="right">{row.total_elevation_gain.toFixed(2)}</TableCell>
                                        <TableCell align="right">{row.pace}</TableCell>
                                        <TableCell align="right">{secondsToHMS(row.moving_time)}</TableCell>
                                    </TableRow>
                                ))}
                            {emptyRows > 0 && (
                                <TableRow style={{height: 53 * emptyRows}}>
                                    <TableCell colSpan={6}/>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25, 50, 100]}
                    component="div"
                    count={activities.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onChangePage={handleChangePage}
                    onChangeRowsPerPage={handleChangeRowsPerPage}
                />
            </Paper>
        </React.Fragment>
    )
}
