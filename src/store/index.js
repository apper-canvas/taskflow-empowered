import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';

const store = configureStore({
  reducer: {
    user: userReducer,
    // Add other reducers here as needed
  },
  devTools: import.meta.env.DEV
});

export default store;