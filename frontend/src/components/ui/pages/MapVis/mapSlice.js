import {createSlice} from "@reduxjs/toolkit";
import {call} from "../../../../utils/api";
import config from "../../../../app/config/config.json";

// TODO: This is quite similar to the searchAPISlice -> All of this needs a redesign to reduce duplication
//       Decided to have this separate to the search form as both might want to be populated at once, and they're
//       independent of each other, despite having similar API functionality

export const defaultZoom = 15;
// If we can't get the user's location, initialise the map at stonehenge, because it's cool.
const backupLocation = [51.1789, -1.8262];

const queryParams = (optionState) => {
    return Object.entries(optionState)
        .map((key) => `${encodeURIComponent(key[0])}=${encodeURIComponent(key[1])}`)
        .join("&");
};

export const slice = createSlice({
    name: 'statsData',
    initialState: {
        latLngSpeeds: {points: [], stats: null},
        map: {
            viewport: {
                center: null,
                zoom: defaultZoom,
            },
            bounds: null,
            options: {
                intersect: false,
                granularity: 3
            }
        },
        data: {
            errorMessage: null,
            waiting: false
        }
    },
    reducers: {
        searchFetch: state => {
            state.data.waiting = true;
        },
        searchDone: state => {
            state.data.waiting = false;
        },
        searchSuccess: (state, action) => {
            if (action.payload.data === undefined) {
                return;
            }
            state.latLngSpeeds = action.payload.data;
            state.data.errorMessage = null;
        },
        searchError: (state, action) => {
            state.data.waiting = false;
            state.data.errorMessage = action.payload.message;
        },
        searchClearError: state => {
            state.data.errorMessage = null;
        },
        updateMapBounds: (state, action) => {
            state.map.bounds = action.payload;
        },
        updateMapViewport: (state, action) => {
            state.map.viewport = action.payload;
        },
        updateOptionState: (state, action) => {
            state.map.options = {
                ...state.map.options,
                ...action.payload
            };
        },
        setMapCentre: (state, action) => {
            state.map.viewport.center = action.payload.position;
        }
    }
});


export const {
    updateMapBounds,
    updateMapViewport,
    searchFetch,
    searchDone,
    searchSuccess,
    searchError,
    updateOptionState,
    setMapCentre
} = slice.actions;

export const loadStats = () => (dispatch, getState) => {
    const state = getState().mapsApi;

    if (state.map.bounds === null) {
        return;
    }
    const ne = state.map.bounds.ne;
    const sw = state.map.bounds.sw;
    let url = `/geo/speed/${ne.lng},${ne.lat}/${sw.lng},${sw.lat}`;
    url += "?" + queryParams(state.map.options);

    dispatch(searchFetch());
    call(dispatch, url, searchDone, searchSuccess, searchError)
};

export const setInitialMapPosition = () => (dispatch, getState) => {
    const successCb = (obj) => {
        dispatch(setMapCentre({position: [obj.coords.latitude, obj.coords.longitude]}))
    }
    const errorCb = (obj) => {
        console.error("Couldn't retrieve user location", obj);
        dispatch(setMapCentre({position: backupLocation}))
    }
    window.navigator.geolocation
        .getCurrentPosition(successCb, errorCb);

}

export const bingLocationSearch = searchValue => (dispatch, getState) => {
    const api_key = config.api_keys.bing_maps;
    searchValue = encodeURIComponent(searchValue);
    const url = `http://dev.virtualearth.net/REST/v1/Locations?query=${searchValue}&maxResults=1&key=${api_key}`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.authenticationResultCode !== "ValidCredentials") {
                throw new Error("Access denied - is the Bing API key correct?");
            }
            if (data.resourceSets[0].resources.length === 0) {
                // TODO: This should have a proper handler
                throw new Error("No results found");
            }

            const location = data.resourceSets[0].resources[0].point.coordinates;
            dispatch(setMapCentre({position: location}));
        })
        .catch(err => console.error(err))
}

export default slice.reducer;
export const selectMapState = state => state.mapsApi.map;
export const selectGeoSpeeds = state => state.mapsApi.latLngSpeeds;