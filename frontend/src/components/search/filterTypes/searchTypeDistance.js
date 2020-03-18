import {useDispatch, useSelector} from "react-redux";
import {selectFormState, updateHigh, updateLow} from "../searchUiSlice";
import React from "react";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";

export default function DistanceSearchFields() {
    const dispatch = useDispatch();
    const formState = useSelector(selectFormState);

    const updateSearchField = (e, action) => {
        const val = e.target.value;
        dispatch(action(val))
    };

    return (
        <React.Fragment>
            <Grid item xs={1}>
                <TextField
                    id="distance-low"
                    label="Distance Low"
                    type="number"
                    InputLabelProps={{
                        shrink: true,
                    }}
                    value={formState.values.low}
                    onChange={e => updateSearchField(e, updateLow)}
                />
            </Grid>
            <Grid item xs={1}>
                <TextField
                    id="distance-high"
                    label="Distance High"
                    type="number"
                    InputLabelProps={{
                        shrink: true,
                    }}
                    value={formState.values.high}
                    onChange={e => updateSearchField(e, updateHigh)}
                />
            </Grid>
        </React.Fragment>
    )
}