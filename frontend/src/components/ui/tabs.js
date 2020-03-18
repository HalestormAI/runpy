import PropTypes from 'prop-types';

import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import React from "react";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import SearchResultTableComponent from "../resultTable";

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
    return (
        <React.Fragment>
            <Tabs value={tabId} onChange={handleChange} aria-label="simple tabs example">
                <Tab label="Table" {...a11yProps(0)} />
                <Tab label="Plots" {...a11yProps(1)} />
            </Tabs>
            <TabPanel value={tabId} index={0}>
                <SearchResultTableComponent/>
            </TabPanel>
            <TabPanel value={tabId} index={1}>
                Item Two
            </TabPanel>
        </React.Fragment>
    )

}
