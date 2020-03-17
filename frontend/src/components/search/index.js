import React from "react";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import SearchIcon from '@material-ui/icons/Search';
import {useDispatch, useSelector} from "react-redux";
import {selectFormState} from "./searchUiSlice";
import {performSearch} from "./searchApiSlice";
import DistanceSearchFields from "./filterTypes/searchTypeDistance";

export default function StravaSearchComponent() {
    const dispatch = useDispatch();
    const formState = useSelector(selectFormState);

    const handleSubmit = e => {
        e.preventDefault();
        dispatch(performSearch());
        return false;
    };

    return (
        <form onSubmit={handleSubmit} autoComplete="off">
            <Grid container spacing={3}>
                <Grid item xs={2}>
                    Search:
                </Grid>
                {formState.type === "distance" &&
                <DistanceSearchFields/>
                }
                <Grid item xs={2}>
                    <Button
                        variant="contained"
                        color="primary"
                        type="submit"
                        endIcon={<SearchIcon/>}
                    >
                        Search
                    </Button>
                </Grid>
            </Grid>
        </form>
    )
}
