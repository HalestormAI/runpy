import {createSlice} from "@reduxjs/toolkit";
import {call} from "../../../../utils/api";


export const slice = createSlice({
    name: 'distanceRecordData',
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
                console.log("Didn't get data back...", action.payload)
                return;
            }
            state.result[action.payload.distance] = action.payload.data.map(x => ({
                date: x.start_date,
                ...x
            }));
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


export const {
    searchFetch,
    searchDone,
    searchSuccess,
    searchError,
    searchClearError,
    updateSelectedWeek
} = slice.actions;

export const loadResult = (d) => (dispatch, getState) => {
    const url = `/records/running/${d}`;
    console.log("Search URL: ", url)
    dispatch(searchFetch());
    call(dispatch, url, searchDone, searchSuccess, searchError)
};

export default slice.reducer;
export const selectResult = state => state.distanceRecordApi.result;
export const selectWeekDetails = state => state.distanceRecordApi.selectedWeek;