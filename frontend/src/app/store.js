import { configureStore } from '@reduxjs/toolkit';
import counterReducer from '../features/counter/counterSlice';
import apiReducer from '../components/ui/nav/DataButtons/dataSlice';

export default configureStore({
  reducer: {
    counter: counterReducer,
    api: apiReducer
  },
});
