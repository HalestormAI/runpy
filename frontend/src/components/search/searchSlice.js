import {createSlice} from "@reduxjs/toolkit";
import {call} from "../../utils/api";


export const slice = createSlice({
    name: 'searchData',
    initialState: {
        activities: [],
        errorMessage: null,
        waiting: false
    },
    reducers: {
        searchFetch: state => {
            state.waiting = true;
        },
        searchDone: state => {
            state.waiting = false;
        },
        searchSuccess: (state, action) => {
            // TODO: Parse out the JSON and store into the state
            console.log(action.payload);
            state.errorMessage = null;
        },
        searchError: (state, action) => {
            state.waiting = false;
            state.errorMessage = action.payload.message;
        },
        searchClearError: state => {
            state.errorMessage = null;
        }
    }
});


export const {searchFetch, searchDone, searchSuccess, searchError, searchClearError} = slice.actions;

export const search = () => dispatch => {
    // const url = `/search/distance/${form_elem.distance_low.value}/${form_elem.distance_high.value}`;

    dispatch(searchFetch());
    call(dispatch, apiUri, searchDone, searchSuccess, searchError)
};

export default slice.reducer;
export const selectSearchWaiting = state => state.search.waiting;
export const selectSearchErrorMessage = state => state.search.errorMessage;
export const selectSearchActivities = state => state.search.activities;