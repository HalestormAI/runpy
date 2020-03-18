import {useDispatch, useSelector} from "react-redux";
import {selectFormState, updateHigh, updateLow} from "../searchUiSlice";
import React, {useEffect} from "react";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";

export default function DistanceSearchFields(props) {
    const {registerValidationFields, updateValidationState} = props;

    const dispatch = useDispatch();
    const formState = useSelector(selectFormState);

    const updateSearchField = (e, name, action) => {
        const val = e.target.value;
        dispatch(action(val));
        setValidState({...validState, [name]: isValid(val)});
        updateValidationState(name, isValid(val));
    };

    const isValid = v => {
        v = Number(v);
        const valid = !isNaN(v) && v > 0;
        return valid;
    };

    const [validState, setValidState] = React.useState({low: false, high: false});
    const [registeredState, setRegisteredState] = React.useState(false);

    useEffect(() => {
        if (!registeredState) {
            registerValidationFields(["low", "high"]);
            setRegisteredState(true);
        }
    });


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
                    error={!validState.low}
                    required
                    onChange={e => updateSearchField(e, "low", updateLow)}
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
                    required
                    error={!validState.high}
                    onChange={e => updateSearchField(e, "high", updateHigh)}
                />
            </Grid>
        </React.Fragment>
    )
}