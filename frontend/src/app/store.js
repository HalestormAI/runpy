import {configureStore} from '@reduxjs/toolkit';
import apiReducer from '../components/ui/nav/DataButtons/dataSlice';
import uiThemeReducer from '../components/ui/themeSlice';
import searchApiReducer from '../components/search/searchApiSlice';
import searchFormReducer from '../components/search/searchUiSlice';
import resultTableReducer from '../components/resultTable/resultTableSlice';
import temporalStatsReducer from '../components/ui/pages/TemporalStats/temporalStatsSlice'
import mapApiReducer from '../components/ui/pages/MapVis/mapSlice'
import weeklyAggReducer from '../components/ui/pages/WeeklyAggSearch/weeklyAggSlice'
import distanceRecordReducer from '../components/ui/pages/DistanceRecords/distanceRecordSlice'

export default configureStore({
  reducer: {
    api: apiReducer,
    uiTheme: uiThemeReducer,
    searchApi: searchApiReducer,
    searchForm: searchFormReducer,
    resultTable: resultTableReducer,
    statsApi: temporalStatsReducer,
    mapsApi: mapApiReducer,
    weeklyAggApi: weeklyAggReducer,
    distanceRecordApi: distanceRecordReducer,
  },
});
