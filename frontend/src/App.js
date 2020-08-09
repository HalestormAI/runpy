import React from 'react';
import {useDispatch, useSelector} from "react-redux";
import useMediaQuery from '@material-ui/core/useMediaQuery';
import {createMuiTheme, ThemeProvider} from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import {selectDarkMode, selectDmMediaQueryState, updateMediaQueryState} from "./components/ui/themeSlice";
import {TabContainer} from "./components/ui/tabs";
import Navbar from "./components/ui/nav";
import './App.css';


function App() {
    const prefersDarkMode = useSelector(selectDarkMode);
    const currentMediaQueryResult = useSelector(selectDmMediaQueryState);
    const dispatch = useDispatch();
    const mqDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

    if (currentMediaQueryResult !== mqDarkMode) {
        dispatch(updateMediaQueryState(mqDarkMode));
    }

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
                        <TabContainer/>
                    </Grid>
                </Grid>
            </Container>
        </ThemeProvider>
    );
}

export default App;
