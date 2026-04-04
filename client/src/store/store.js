import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/store/authSlice";
import documentSystemReducer from "@/store/documents.slice";
import notificationReducer from "@/store/notification.slice";
import activityReducer from "@/store/activity.slice";
import socketMiddleware from "@/middlewares/socket.middleware";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    documentSystem: documentSystemReducer,
    notifications: notificationReducer,
    activity: activityReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(socketMiddleware),
});
