import {configureStore} from '@reduxjs/toolkit';
import apiReducer from '../components/ui/nav/DataButtons/dataSlice';
import searchApiReducer from '../components/search/searchApiSlice';
import searchFormReducer from '../components/search/searchUiSlice';

export default configureStore({
  reducer: {
    api: apiReducer,
    searchApi: searchApiReducer,
    searchForm: searchFormReducer
  },
});
