import {createSlice} from "@reduxjs/toolkit";
import {call} from "../../../../utils/api";

// TODO: This is quite similar to the searchAPISlice -> All of this needs a redesign to reduce duplication
//       Decided to have this separate to the search form as both might want to be populated at once, and they're
//       independent of each other, despite having similar API functionality

export const slice = createSlice({
    name: 'statsData',
    initialState: {
        activities: {},
        options: {
            frequency: "monthly",
            show_mean: true,
            show_markers: false
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
            if (action.payload.activities === undefined) {
                return;
            }
            state.activities = action.payload.activities;
            state.data.errorMessage = null;
        },
        searchError: (state, action) => {
            state.data.waiting = false;
            state.data.errorMessage = action.payload.message;
        },
        searchClearError: state => {
            state.data.errorMessage = null;
        },
        updateOptionState: (state, action) => {
            state.options = {
                ...state.options,
                ...action.payload
            };
        }
    }
});


export const {searchFetch, searchDone, searchSuccess, searchError, searchClearError, updateOptionState} = slice.actions;

export const loadStats = () => (dispatch, getState) => {
    const url = "/search/rolling?frequency=" + getState().statsApi.options.frequency;
    dispatch(searchFetch());
    call(dispatch, url, searchDone, searchSuccess, searchError)
};

export default slice.reducer;
export const selectOptions = state => state.statsApi.options;
export const selectActivities = state => state.statsApi.activities;