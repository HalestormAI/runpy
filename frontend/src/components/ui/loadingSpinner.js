import Grid from "@material-ui/core/Grid";
import CircularProgress from "@material-ui/core/CircularProgress";
import React from "react";

export default function LoadingSpinner(props) {
    return (<Grid
        container
        spacing={0}
        direction="column"
        alignItems="center"
        justify="center"
        style={{minHeight: '70vh'}}
    >

        <Grid item xs={12}>
            <CircularProgress/>
        </Grid>

    </Grid>);
}