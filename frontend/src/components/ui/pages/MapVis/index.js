import React from "react";
import {Map, TileLayer, Marker, Popup} from "react-leaflet"

export default function MapVisPage(props) {
    const [state, setState] = React.useState({
        lat: 51.478060,
        lng: -2.627330,
        zoom: 13
    });

    const position = [state.lat, state.lng];
    return (
        <Map center={position} zoom={state.zoom}>
            <TileLayer
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                url='https://{s}.tile.osm.org/{z}/{x}/{y}.png'
            />
            <Marker position={position}>
                <Popup>
                    A pretty CSS3 popup. <br/> Easily customizable.
                </Popup>
            </Marker>
        </Map>
    )
}