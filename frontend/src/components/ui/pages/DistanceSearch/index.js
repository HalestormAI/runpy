import React from "react";
import Grid from "@material-ui/core/Grid";
import StravaSearchComponent from "../../../search";
import SearchResultPlotComponent from "../../../resultPlot";
import SearchResultTableComponent from "../../../resultTable";
import {useSelector} from "react-redux";
import {selectActivities} from "../../../search/searchApiSlice";

export default function DistanceSearchPage(props) {
    const activities = useSelector(selectActivities);

    return (
        <React.Fragment>
            <Grid item xs={12}>
                <StravaSearchComponent/>
            </Grid>
            {activities.length > 0 && (
                <Grid item xs={12}>
                    <SearchResultPlotComponent/>
                    <SearchResultTableComponent/>
                </Grid>
            )}
        </React.Fragment>
    )
}