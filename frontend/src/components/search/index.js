import React from "react";
import TextField from "@material-ui/core/TextField";
import Grid from "@material-ui/core/Grid";
import Container from "@material-ui/core/Container";
import Button from "@material-ui/core/Button";
import SearchIcon from '@material-ui/icons/Search';
import {useDispatch} from "react-redux";

export default function StravaSearchComponent() {
    const dispatch = useDispatch();

    return (
        <form noValidate autoComplete="off">
            <Grid container spacing={3}>
                <Grid item xs={2}>
                    Search:
                </Grid>
                <Grid item xs={2}>
                    <TextField
                        id="distance-low"
                        label="Distance Low"
                        type="number"
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                </Grid>
                <Grid item xs={2}>
                    <TextField
                        id="distance-high"
                        label="Distance High"
                        type="number"
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                </Grid>
                <Grid item xs={2}>
                    <Button
                        variant="contained"
                        color="primary"
                        endIcon={<SearchIcon/>}
                    >
                        Search
                    </Button>
                </Grid>
            </Grid>
        </form>
    )
}