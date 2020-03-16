import React from "react";
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from "@material-ui/icons/Delete";
import Button from "@material-ui/core/Button";
import {apiCall} from "./dataSlice";
import {useSelector, useDispatch} from 'react-redux';
import {selectApiWaiting} from "./dataSlice";

export function DataButtons() {
    const apiWaiting = useSelector(selectApiWaiting);
    const dispatch = useDispatch();

    return (
        <div>
            <div>
                <Button color="inherit" variant="outlined" onClick={() =>
                    dispatch(apiCall("/data/fetch/activities"))} disabled={apiWaiting}>Download Latest</Button>
                <IconButton color="secondary" aria-label="delete" onClick={() =>
                    dispatch(apiCall("/data/clear/activities"))} disabled={apiWaiting}> <DeleteIcon/></IconButton>
            </div>
        </div>
    )
}