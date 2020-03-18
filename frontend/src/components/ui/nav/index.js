import React from "react";
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import {DataButtons} from "./DataButtons"
import {useDispatch, useSelector} from "react-redux";
import {apiClearState, selectApiWaiting, selectStatus} from "./DataButtons/dataSlice";
import {LinearProgress} from "@material-ui/core";
import Snackbar from "@material-ui/core/Snackbar";
import MuiAlert from '@material-ui/lab/Alert';

function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
}

function haveDownloadedItems(items) {
    return items.hasOwnProperty("activities") && items.activities.length !== 0
}

function getActivityString(haveItems, activities) {
    if (!haveItems) {
        return "";
    }

    return activities.length > 1 ? "activities" : `activity (${activities[0].name})`
}

export default function Navbar() {
    const apiStatus = useSelector(selectStatus);
    const apiWaiting = useSelector(selectApiWaiting);
    const dispatch = useDispatch();

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        dispatch(apiClearState());
    };


    const haveItems = haveDownloadedItems(apiStatus.downloaded_items);
    const numItems = haveItems ? apiStatus.downloaded_items.activities.length : 0;
    const activityString = getActivityString(haveItems, apiStatus.downloaded_items.activities);

    return (
        <AppBar position="static">
            <Toolbar>
                <IconButton
                    edge="start"
                    color="inherit"
                    aria-label="open drawer"
                >
                    <MenuIcon/>
                </IconButton>
                <DataButtons/>
            </Toolbar>
            <Snackbar open={apiStatus.show} autoHideDuration={6000} onClose={handleClose}>
                <Alert onClose={handleClose} severity={apiStatus.type === "error" ? "error" : "success"}>
                    {haveItems ? `Downloaded ${numItems} ${activityString}.` : apiStatus.message}
                </Alert>
            </Snackbar>
            <LinearProgress hidden={!apiWaiting} color="primary" variant="query"/>
        </AppBar>
    )
}