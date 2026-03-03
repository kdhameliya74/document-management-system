import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import documentSystemReducer from "./documents.slice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    documentSystem: documentSystemReducer,
  },
});
