import {createSlice} from "@reduxjs/toolkit";

const validFormTypes = ["distance"];

export function isValidFormType(formType) {
    return validFormTypes.indexOf(formType) !== -1;
}


export const initialState = {
    type: "distance",
    values: {
        low: "",
        high: ""
    }
};

export const slice = createSlice({
    name: 'searchData',
    initialState,
    reducers: {
        updateLow: (state, action) => {
            state.values.low = action.payload
        },
        updateHigh: (state, action) => {
            state.values.high = action.payload
        },
        setType: (state, action) => {
            if (!isValidFormType(action.payload)) {
                throw Error("Only distance search is implemented so far..")
            }
        }
    }
});


export const {updateLow, updateHigh, setType} = slice.actions;

export default slice.reducer;

export const selectFormState = state => state.searchForm;
