import {createSlice} from "@reduxjs/toolkit";
import {call} from "../../../../utils/api";

export const slice = createSlice({
    name: 'apiData',
    initialState: {
        response: null,
        status: {
            show: false,
            type: null,
            message: "",
            downloaded_items: {}
        },
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
            state.status.message = "Success!";
            state.status.downloaded_items = action.payload.hasOwnProperty("downloaded") ? action.payload.downloaded : [];
            state.status.type = "success";
            state.status.show = true;
        },
        apiError: (state, action) => {
            state.waiting = false;
            state.status.message = action.payload.message;
            state.status.type = "error";
            state.status.show = true;
        },
        apiClearState: state => {
            state.status.show = false;
            state.status.message = null;
            state.status.downloaded_items = []
        }
    }
});

export const {apiFetch, apiDone, apiError, apiSuccess, apiClearState} = slice.actions;

export const apiCall = apiUri => dispatch => {
    dispatch(apiFetch());
    call(dispatch, apiUri, apiDone, apiSuccess, apiError)
};

export default slice.reducer;
export const selectApiWaiting = state => state.api.waiting;
export const selectStatus = state => state.api.status;