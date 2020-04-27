import {createSlice} from "@reduxjs/toolkit"

function getLocalStorageBool(key) {
    const val = localStorage.getItem(key);
    return val === null ? val : val === "true"
}

export const slice = createSlice({
    name: 'uiThemeData',
    initialState: {
        darkMode: {
            mediaQueryResult: null,
            localPref: getLocalStorageBool("darkModePreference")
        }
    },
    reducers: {
        updateMediaQueryState: (state, action) => {
            state.darkMode.mediaQueryResult = action.payload;
        },
        updateDarkModePref: (state, action) => {
            localStorage.setItem("darkModePreference", action.payload);
            state.darkMode.localPref = action.payload
        },
        clearDarkModePref: (state) => {
            // Clear the user preference then re-query the browser
            localStorage.removeItem("darkModePreference");
            state.darkMode.localPref = null;

        }
    }
});


export const {updateMediaQueryState, updateDarkModePref, clearDarkModePref} = slice.actions;
export const selectDarkMode = state => {
    const pref = state.uiTheme.darkMode.localPref;
    return (pref === null) ? state.uiTheme.darkMode.mediaQueryResult === true : pref;
};

export const selectDmMediaQueryState = state => {
    return state.uiTheme.darkMode.mediaQueryResult;
};

export default slice.reducer;
