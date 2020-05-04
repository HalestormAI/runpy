import {createSlice} from "@reduxjs/toolkit";
import {call} from "../../utils/api";


// FIXME: For now, I'm hacking this in. The search API is due to change
// (e.g. https://trello.com/c/UZ5za0nt/1-graphql-for-better-querying)
// so this should be a stop-gap once I go back to the back-end
function buildSearchUrl(state) {
    const distanceForm = values => {
        return `/search/distance/${values.low}/${values.high}`
    };

    let builder = null;
    if (state.searchForm.type === "distance") {
        builder = distanceForm;
    } else {
        throw Error("Invalid URL builder type for search");
    }

    return builder(state.searchForm.values);
}

export const initialState = {
    activities: [],
    data: {
        errorMessage: null,
        waiting: false
    }
};

export const slice = createSlice({
    name: 'searchData',
    initialState,
    reducers: {
        searchFetch: state => {
            state.data.waiting = true;
        },
        searchDone: state => {
            state.data.waiting = false;
        },
        searchSuccess: (state, action) => {
            state.activities = action.payload.activities;
            state.data.errorMessage = null;
        },
        searchError: (state, action) => {
            state.data.waiting = false;
            state.data.errorMessage = action.payload.message;
        },
        searchClearError: state => {
            state.data.errorMessage = null;
        }
    }
});


export const {searchFetch, searchDone, searchSuccess, searchError, searchClearError} = slice.actions;

export const performSearch = () => (dispatch, getState) => {
    const url = buildSearchUrl(getState());
    dispatch(searchFetch());
    call(dispatch, url, searchDone, searchSuccess, searchError)
};

export default slice.reducer;
export const selectApiState = state => state.searchApi.data;
export const selectActivities = state => state.searchApi.activities;