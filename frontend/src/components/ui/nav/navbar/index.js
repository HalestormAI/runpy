import React from "react";
import NavButton from "../navbutton"

class Navbar extends React.Component {
    render() {
        return (
            <nav className="pure-menu pure-menu-horizontal">
                <ul className="pure-menu-list">
                    <NavButton label="Refresh" clickHandler={this.refreshCallback}/>
                    <NavButton label="Clear" clickHandler={this.clearCallback}/>
                </ul>
            </nav>
        )
    }

    refreshCallback = () => alert("Refreshing");
    clearCallback = () => alert("Clearing");
}

export default Navbar