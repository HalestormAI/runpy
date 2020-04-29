import {createSlice} from "@reduxjs/toolkit";
import {call} from "../../../../utils/api";

// TODO: This is quite similar to the searchAPISlice -> All of this needs a redesign to reduce duplication
//       Decided to have this separate to the search form as both might want to be populated at once, and they're
//       independent of each other, despite having similar API functionality

// TODO: Get shot of this:
const DEFAULT_VIEWPORT = {
    center: [51.49686, -2.54510],
    zoom: 15,
};

export const slice = createSlice({
    name: 'statsData',
    initialState: {
        latLngSpeeds: [[]],
        map: {
            viewport: DEFAULT_VIEWPORT,
            bounds: null
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
        }
    }
});


export const {updateMapBounds, updateMapViewport, searchFetch, searchDone, searchSuccess, searchError, searchClearError} = slice.actions;

export const loadStats = () => (dispatch, getState) => {
    const state = getState().mapsApi;

    if (state.map.bounds === null) {
        return;
    }
    const ne = state.map.bounds.ne;
    const sw = state.map.bounds.sw;
    const url = `/geo/speed/${ne.lng},${ne.lat}/${sw.lng},${sw.lat}`;
    dispatch(searchFetch());
    call(dispatch, url, searchDone, searchSuccess, searchError)
};

export default slice.reducer;
export const selectMapState = state => state.mapsApi.map;
export const selectGeoSpeeds = state => state.mapsApi.latLngSpeeds;