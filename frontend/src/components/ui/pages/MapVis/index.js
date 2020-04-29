import React from "react";
import {LayersControl, Map, Marker, Popup, TileLayer} from "react-leaflet"
import {BingLayer} from "react-leaflet-bing-v2"
import config from "../../../../app/config/config";

const {BaseLayer} = LayersControl;

export default function MapVisPage(props) {
    const [state, setState] = React.useState({
        lat: 51.49686,
        lng: -2.54510,
        zoom: 15
    });

    const position = [state.lat, state.lng];
    return (
        <Map center={position} zoom={state.zoom}>
            <LayersControl>
                <BaseLayer checked name='Ordnance Survey'>
                    <BingLayer bingkey={config.api_keys.bing_maps} type="OrdnanceSurvey"/>
                </BaseLayer>
                <BaseLayer name='OSM'>
                    <TileLayer
                        attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                </BaseLayer>

            </LayersControl>
            <Marker position={position}>
                <Popup>
                    A pretty CSS3 popup. <br/> Easily customizable.
                </Popup>
            </Marker>
        </Map>
    )
}