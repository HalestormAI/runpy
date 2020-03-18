import React from 'react';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import {createMuiTheme, ThemeProvider} from '@material-ui/core/styles';
import './App.css';
import Navbar from "./components/ui/nav";
import CssBaseline from '@material-ui/core/CssBaseline';
import StravaSearchComponent from "./components/search";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import SearchResultTableComponent from "./components/resultTable";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import {TabContainer, TabPanel} from "./components/ui/tabs";
import {useSelector} from "react-redux";
import {selectActivities} from "./components/search/searchApiSlice";

function App() {
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    const theme = React.useMemo(
        () =>
            createMuiTheme({
                palette: {
                    type: prefersDarkMode ? "dark" : "light",
                },
            }),
        [prefersDarkMode]
    );

    let activities = useSelector(selectActivities);
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline/>
            <Container maxWidth="xl">
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Navbar/>
                    </Grid>
                    <Grid item xs={12}>
                        <StravaSearchComponent/>
                    </Grid>
                {activities.length > 0 && (
                    <Grid item xs={12}>
                        <TabContainer/>
                    </Grid>
                )}
                </Grid>
            </Container>
        </ThemeProvider>
    );
}

export default App;
