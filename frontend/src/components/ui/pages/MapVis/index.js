import React, {useEffect, useRef} from "react";
import {LayersControl, Map, TileLayer} from "react-leaflet"
import {BingLayer} from "react-leaflet-bing-v2"
import config from "../../../../app/config/config";
import {loadStats, selectGeoSpeeds, selectMapState, updateMapBounds, updateMapViewport} from "./mapSlice";
import {useDispatch, useSelector} from "react-redux";
import {serialiseBounds} from "../../../../utils/maps";
import HeatmapLayer from "react-leaflet-heatmap-layer/lib/HeatmapLayer";

const {BaseLayer} = LayersControl;


export default function MapVisPage(props) {
    const mapState = useSelector(selectMapState);
    const geoSpeeds = useSelector(selectGeoSpeeds);
    const dispatch = useDispatch();
    const mapRef = useRef();
    useEffect(() => {
        dispatch(updateMapBounds(serialiseBounds(mapRef.current.leafletElement.getBounds())));
        dispatch(loadStats());
    }, []);

    const onViewportChanged = (viewport) => {
        dispatch(updateMapViewport(viewport));
        dispatch(updateMapBounds(serialiseBounds(mapRef.current.leafletElement.getBounds())));
        dispatch(loadStats());
    };

    return (
        <Map
            onViewportChanged={onViewportChanged}
            viewport={mapState.viewport}
            ref={mapRef}>
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
                <HeatmapLayer name='pace' checked
                              points={geoSpeeds}
                              longitudeExtractor={m => m[1]}
                              latitudeExtractor={m => m[0]}
                              intensityExtractor={m => parseFloat(m[2])}/>
            </LayersControl>
        </Map>
    )
}