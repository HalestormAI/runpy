import React from "react";
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Button from "@material-ui/core/Button";
import DeleteIcon from '@material-ui/icons/Delete';
import MenuIcon from '@material-ui/icons/Menu';

class Navbar extends React.Component {
    render() {
        return (
            <AppBar position="static">
                <Toolbar>
                    <IconButton
                        edge="start"
                        color="inherit"
                        aria-label="open drawer"
                    >
                        <MenuIcon/>
                    </IconButton>

                    <IconButton edge="start" color="inherit" aria-label="menu">
                    </IconButton>
                    <Button color="inherit" variant="outlined">Download Latest</Button>
                    <IconButton color="secondary" aria-label="delete"> <DeleteIcon/></IconButton>
                </Toolbar>
            </AppBar>

        )
    }

    refreshCallback = () => alert("Refreshing");
    clearCallback = () => alert("Clearing");
}

export default Navbar