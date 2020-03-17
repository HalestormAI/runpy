import {createSlice} from "@reduxjs/toolkit";


export const slice = createSlice({
    name: 'searchData',
    initialState: {
        type: "distance",
        values: {
            "low": "",
            "high": ""
        }
    },
    reducers: {
        updateLow: (state, action) => {
            state.values.low = action.payload
        },
        updateHigh: (state, action) => {
            state.values.high = action.payload
        },
        setType: (state, action) => {
            if (action.payload !== "distance") {
                throw Error("Only distance search is implemented so far..")
            }
        }
    }
});


export const {updateLow, updateHigh, setType} = slice.actions;

export default slice.reducer;

export const selectFormState = state => state.searchForm;
