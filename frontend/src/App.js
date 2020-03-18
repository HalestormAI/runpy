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
                    <Grid item xs={12}>
                        <SearchResultTableComponent/>
                    </Grid>
                </Grid>
            </Container>
        </ThemeProvider>
    );
}

export default App;
