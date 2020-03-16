import {createSlice} from "@reduxjs/toolkit";
import {call} from "../../../../utils/api";

export const slice = createSlice({
    name: 'apiData',
    initialState: {
        response: null,
        errorMessage: null,
        waiting: false
    },
    reducers: {
        apiFetch: state => {
            state.waiting = true;
        },
        apiDone: state => {
            state.waiting = false;
        },
        apiSuccess: (state, action) => {
            state.response = action.payload;
            state.errorMessage = null;
        },
        apiError: (state, action) => {
            state.waiting = false;
            state.errorMessage = action.payload.message;
        },
        apiClearError: state => {
            state.errorMessage = null;
        }
    }
});

export const {apiFetch, apiDone, apiError, apiSuccess, apiClearError} = slice.actions;

export const apiCall = apiUri => dispatch => {
    dispatch(apiFetch());
    call(dispatch, apiUri, apiDone, apiFetch, apiSuccess, apiError)
};

export default slice.reducer;
export const selectApiWaiting = state => state.api.waiting;
export const selectApiErrorMessage = state => state.api.errorMessage;