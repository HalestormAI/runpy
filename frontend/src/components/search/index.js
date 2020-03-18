import React from "react";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import SearchIcon from '@material-ui/icons/Search';
import {useDispatch, useSelector} from "react-redux";
import {selectFormState} from "./searchUiSlice";
import {performSearch, selectApiState} from "./searchApiSlice";
import DistanceSearchFields from "./filterTypes/searchTypeDistance";
import CircularProgress from "@material-ui/core/CircularProgress";
import makeStyles from "@material-ui/core/styles/makeStyles";
import {grey} from '@material-ui/core/colors';

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    alignItems: 'center',
  },
    wrapper: {
        // margin: theme.spacing(1),
        position: 'relative',
    },
    buttonProgress: {
        color: grey[500],
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: -12,
        marginLeft: -12,
    }
}));

export default function StravaSearchComponent() {
    const dispatch = useDispatch();
    const formState = useSelector(selectFormState);
    const apiState = useSelector(selectApiState);

    const [validState, setValidState] = React.useState({});
    const formIsValid = () => Object.values(validState).reduce((isValid, fieldValid) => isValid && fieldValid, true);

    const handleSubmit = e => {
        e.preventDefault();
        if (formIsValid()) {
            dispatch(performSearch());
        }

        return false;
    };

    // TODO: This is pretty hairy, probably needs rethinking...
    const registerValidationFields = (names) => {
        setValidState(names.reduce((nameValid, name) => ({
            ...nameValid,
            [name]: false
        }), validState));
    };

    const updateFieldValidation = (name, isValid) => {
        setValidState({...validState, [name]: isValid});
    };

    const classes = useStyles();

    return (
        <form onSubmit={handleSubmit} autoComplete="off">
            <Grid container spacing={3}>
                <Grid item xs={1}>
                    Search:
                </Grid>
                {formState.type === "distance" &&
                <DistanceSearchFields registerValidationFields={registerValidationFields}
                                      updateValidationState={updateFieldValidation}/>
                }
                <Grid item xs={1} className={classes.root}>
                    <div className={classes.wrapper}>
                        <Button
                            variant="contained"
                            color="primary"
                            type="submit"
                            endIcon={<SearchIcon/>}
                            disabled={apiState.waiting}
                        >
                            Search
                        </Button>
                        {apiState.waiting && <CircularProgress size={24} className={classes.buttonProgress} color="primary"/>}
                    </div>
                </Grid>
            </Grid>
        </form>
    )
}
