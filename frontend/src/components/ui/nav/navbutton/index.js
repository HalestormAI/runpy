import React from "react";

class NavButton extends React.Component {
  render() {
    return (
        <li className="pure-menu-item">
          <button onClick={this.props.clickHandler}>
            {this.props.label}
          </button>
        </li>
    )
  }
}

export default NavButton;