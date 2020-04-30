import {createSlice} from "@reduxjs/toolkit";
import {call} from "../../../../utils/api";

// TODO: This is quite similar to the searchAPISlice -> All of this needs a redesign to reduce duplication
//       Decided to have this separate to the search form as both might want to be populated at once, and they're
//       independent of each other, despite having similar API functionality

export const defaultZoom = 15;

// TODO: Get shot of this:
const DEFAULT_VIEWPORT = {
    center: [51.49686, -2.54510],
    zoom: defaultZoom,
};

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
            viewport: DEFAULT_VIEWPORT,
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
        }
    }
});


export const {updateMapBounds, updateMapViewport, searchFetch, searchDone, searchSuccess, searchError, updateOptionState} = slice.actions;

export const loadStats = () => (dispatch, getState) => {
    const state = getState().mapsApi;

    if (state.map.bounds === null) {
        return;
    }
    const ne = state.map.bounds.ne;
    const sw = state.map.bounds.sw;
    let url = `/geo/speed/${ne.lng},${ne.lat}/${sw.lng},${sw.lat}`;
    url += "?" + queryParams(state.map.options);
    console.log(url)

    dispatch(searchFetch());
    call(dispatch, url, searchDone, searchSuccess, searchError)
};

export default slice.reducer;
export const selectMapState = state => state.mapsApi.map;
export const selectGeoSpeeds = state => state.mapsApi.latLngSpeeds;