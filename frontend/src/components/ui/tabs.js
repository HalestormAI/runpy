import PropTypes from 'prop-types';

import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import React from "react";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import DistanceSearchPage from "./pages/DistanceSearch";
import TemporalStatsPage from "./pages/TemporalStats";
import MapVisPage from "./pages/MapVis";
import WeeklyAggregationStatsPage from "./pages/WeeklyAggSearch";
import DistanceRecordPage from "./pages/DistanceRecords";
import Grid from "@material-ui/core/Grid";

export function TabPanel(props) {
    const {children, value, index, ...other} = props;

    return (
        <Typography
            component="div"
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && <Box p={2}>{children}</Box>}
        </Typography>
    );
}

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.any.isRequired,
    value: PropTypes.any.isRequired,
};

export function TabContainer(props) {
    function a11yProps(index) {
        return {
            id: `simple-tab-${index}`,
            'aria-controls': `simple-tabpanel-${index}`,
        };
    }

    const [tabId, setTabId] = React.useState(0);
    const handleChange = (event, newValue) => {
        setTabId(newValue);
    };

    const distances = [5000, 10000, 16000, 21098];

    return (
        <React.Fragment>
            <Tabs value={tabId} onChange={handleChange} aria-label="simple tabs example">
                <Tab label="Temporal" {...a11yProps(0)} />
                <Tab label="Weekly" {...a11yProps(1)} />
                <Tab label="Distance Search" {...a11yProps(2)} />
                <Tab label="Distance Records" {...a11yProps(3)} />
                <Tab label="Map" {...a11yProps(4)} />
            </Tabs>
            <TabPanel value={tabId} index={0}>
                <TemporalStatsPage/>
            </TabPanel>
            <TabPanel value={tabId} index={1}>
                <WeeklyAggregationStatsPage/>
            </TabPanel>
            <TabPanel value={tabId} index={2}>
                <DistanceSearchPage/>
            </TabPanel>
            <TabPanel value={tabId} index={3}>
                <Grid container spacing={3}>
                    {distances.map(d => (
                        <Grid item xs={6}>
                            <DistanceRecordPage distance={d}/>
                        </Grid>))}
                </Grid>

                {/*<DistanceRecordPage distance={42195} />*/}
            </TabPanel>
            <TabPanel value={tabId} index={4}>
                <MapVisPage/>
            </TabPanel>
        </React.Fragment>
    )

}
