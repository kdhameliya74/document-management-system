import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/store/authSlice";
import documentSystemReducer from "@/store/documents.slice";
import notificationReducer from "@/store/notification.slice";
import { activityApi } from "@/store/api/activity.api";
import socketMiddleware from "@/middlewares/socket.middleware";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    documentSystem: documentSystemReducer,
    notifications: notificationReducer,
    [activityApi.reducerPath]: activityApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(socketMiddleware, activityApi.middleware),
});
