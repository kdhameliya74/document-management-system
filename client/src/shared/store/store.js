import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/features/auth/store/auth.slice";
import documentSystemReducer from "@/features/documents/store/documents.slice";
import notificationReducer from "@/features/notifications/store/notification.slice";
import { activityApi } from "@/features/activity/api/activity.api";
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
