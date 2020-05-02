import React, {useEffect, useRef, useState} from "react";
import {LayersControl, Map, TileLayer} from "react-leaflet"
import {BingLayer} from "react-leaflet-bing-v2"
import config from "../../../../app/config/config";
import {
    bingLocationSearch,
    defaultZoom,
    loadStats,
    selectGeoSpeeds,
    selectMapState,
    setInitialMapPosition,
    updateMapBounds,
    updateMapViewport,
    updateOptionState
} from "./mapSlice";
import {useDispatch, useSelector} from "react-redux";
import {serialiseBounds} from "../../../../utils/maps";
import HeatmapLayer from "react-leaflet-heatmap-layer/lib/HeatmapLayer";
import Switch from "@material-ui/core/Switch";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import LoadingSpinner from "../../loadingSpinner";
import InputBase from "@material-ui/core/InputBase";
import IconButton from "@material-ui/core/IconButton";
import Paper from "@material-ui/core/Paper";
import SearchIcon from '@material-ui/icons/Search';
import makeStyles from "@material-ui/core/styles/makeStyles";
import Grid from "@material-ui/core/Grid";

const {BaseLayer, Overlay} = LayersControl;

function LocationSearchField(props) {
    const {onPerformSearch} = props
    const useStyles = makeStyles((theme) => ({
        root: {
            padding: '2px 4px',
            display: 'flex',
            alignItems: 'center',
            width: 400,
        },
        input: {
            marginLeft: theme.spacing(1),
            flex: 1,
        }
    }));

    const classes = useStyles();
    const [state, setState] = useState({fieldValue: ""})

    const handleKeyPress = event => {
        setState({...state, fieldValue: event.target.value});

        if (event.key === "Enter") {
            onPerformSearch(state.fieldValue);
        }
    }

    return (
        <Paper className={classes.root}>
            <InputBase
                className={classes.input}
                placeholder="Search Location"
                inputProps={{'aria-label': 'search location'}}
                onKeyUp={handleKeyPress}
            />
            <IconButton type="submit" className={classes.iconButton}
                        aria-label="search"
                        onClick={() => onPerformSearch(state.fieldValue)}>
                <SearchIcon/>
            </IconButton>
        </Paper>
    )
}

function MapOptions(props) {

    const {optionsChanged} = props;
    const optionState = useSelector(selectMapState).options;
    // const locationSearchState = useSelector(selectLocationSearch);
    const dispatch = useDispatch();

    const setIntersect = (event) => {
        dispatch(updateOptionState({intersect: event.target.checked}));
        optionsChanged();
    };

    const setGranularity = (event) => {
        dispatch(updateOptionState({granularity: event.target.checked ? 4 : 3}));
        optionsChanged();
    };

    const performLocationSearch = (searchValue) => {
        dispatch(bingLocationSearch(searchValue));
    };

    return (
        <FormGroup row>
            <FormControlLabel
                control={<Switch checked={optionState.intersect} onChange={setIntersect} name="intersectionSwitch"/>}
                label="Intersect Search"
            />
            <FormControlLabel
                control={<Switch checked={optionState.granularity === 4} onChange={setGranularity}
                                 name="intersectionSwitch"/>}
                label="High resolution"
            />
            <LocationSearchField onPerformSearch={performLocationSearch}/>
        </FormGroup>
    )
}

export default function MapVisPage(props) {
    const mapState = useSelector(selectMapState);
    const geoData = useSelector(selectGeoSpeeds);
    const dispatch = useDispatch();
    const mapRef = useRef();

    const updateData = bounds => {
        dispatch(updateMapBounds(serialiseBounds(bounds)));
        dispatch(loadStats());
    };

    useEffect(() => {
        if (mapState.viewport.center !== null) {
            updateData(mapRef.current.leafletElement.getBounds());
        }
    }, [mapState.viewport.center]);

    useEffect(() => {
        if (mapState.viewport.center === null) {
            dispatch(setInitialMapPosition());
        }
    }, [mapState.viewport.center]);

    const onViewportChanged = (viewport) => {
        dispatch(updateMapViewport(viewport));
        updateData(mapRef.current.leafletElement.getBounds())
    };

    const points = geoData.points;
    const normMax = (x) => {
        const ret = x / geoData.stats.max;
        return Math.min(Math.max(0, ret), 1);
    };
    let hmGrad = null;
    if (geoData.stats !== null) {
        hmGrad = {
            [normMax(geoData.stats.mean - geoData.stats.std)]: 'blue',
            [normMax(geoData.stats.mean)]: 'lime',
            [normMax(geoData.stats.mean + geoData.stats.std)]: 'red',
        }
    }

    const mapOptionsChanged = () => {
        dispatch(loadStats());
    };

    const granularityVis = {
        3: {
            radius: 16
        },
        4: {
            radius: 4
        }
    };

    let zoomedRadius = granularityVis[mapState.options.granularity].radius - 2.5 * (defaultZoom - mapState.viewport.zoom);
    zoomedRadius = Math.max(Math.min(zoomedRadius, 30), 1)

    return (
        <Grid container className="" spacing={2}>
            <Grid item xs={12}>
                <MapOptions optionsChanged={mapOptionsChanged}/>
            </Grid>
            <Grid item xs={12}>
                {mapState.viewport.center !== null ? (
                    <React.Fragment>
                        <Map
                            onViewportChanged={onViewportChanged}
                            viewport={mapState.viewport}
                            ref={mapRef}>
                            <LayersControl>
                                <BaseLayer name='OSM' checked>
                                    <TileLayer
                                        attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />
                                </BaseLayer>
                                <BaseLayer name='Ordnance Survey'>
                                    <BingLayer bingkey={config.api_keys.bing_maps} type="OrdnanceSurvey"/>
                                </BaseLayer>

                                <Overlay name='Pace Heatmap' checked>
                                    <HeatmapLayer
                                        blur={zoomedRadius / 1.5}
                                        radius={zoomedRadius}
                                        points={points}
                                        gradient={hmGrad}
                                        minOpacity={0.1}
                                        longitudeExtractor={m => m[1]}
                                        latitudeExtractor={m => m[0]}
                                        intensityExtractor={m => parseFloat(2 * m[2])}/>
                                </Overlay>
                            </LayersControl>
                        </Map>
                    </React.Fragment>
                ) : (
                    <LoadingSpinner/>
                )}
            </Grid>
        </Grid>
    )
}