import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import fileSystemReducer from './fileSystemSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    fileSystem: fileSystemReducer,
  },
});
