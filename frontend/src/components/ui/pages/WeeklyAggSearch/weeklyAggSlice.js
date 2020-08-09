import {createSlice} from "@reduxjs/toolkit";
import {call} from "../../../../utils/api";


export const slice = createSlice({
    name: 'aggData',
    initialState: {
        result: {},
        selectedWeek: null,
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
            state.result = action.payload.data;
            state.data.errorMessage = null;
        },
        searchError: (state, action) => {
            state.data.waiting = false;
            state.data.errorMessage = action.payload.message;
        },
        searchClearError: state => {
            state.data.errorMessage = null;
        },
        updateSelectedWeek: (state, action) => {
            state.selectedWeek = action.payload;
        }
    }
});


export const {searchFetch, searchDone, searchSuccess, searchError, searchClearError, updateSelectedWeek} = slice.actions;

export const loadResult = () => (dispatch, getState) => {
    const url = "/aggregated/distance";
    dispatch(searchFetch());
    call(dispatch, url, searchDone, searchSuccess, searchError)
};

export default slice.reducer;
export const selectResult = state => state.weeklyAggApi.result;
export const selectWeekDetails = state => state.weeklyAggApi.selectedWeek;