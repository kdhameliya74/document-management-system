import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import documentSystemReducer from './documentSystemSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    documentSystem: documentSystemReducer,
  },
});
