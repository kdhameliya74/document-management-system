import { io } from "socket.io-client";
import { login, logout, fetchUser } from "@/features/auth/store/auth.slice";
import { syncMissed, notificationReceived, notifyByRipple } from "@/features/notifications/store/notification.slice";

let socket = null;

const socketMiddleware = (store) => (next) => (action) => {
  const result = next(action);
  if ((login.fulfilled.match(action) || fetchUser.fulfilled.match(action)) && !socket?.connected) {
    const socketUrl = import.meta.env.VITE_API_BASE_URL;
    socket = io(socketUrl, {
      withCredentials: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socket.on("connect", () => {
      socket.emit("notification:sync");
    });

    socket.on("notification:new", (notif) => {
      store.dispatch(notificationReceived(notif));
      store.dispatch(notifyByRipple(true));
      socket.emit("notification:ack", { id: notif.id });
      setTimeout(() => {
        store.dispatch(notifyByRipple(false));
      }, 3000);
    });

    socket.on("notification:synced", (data) => {
      if (data.length > 0) {
        store.dispatch(syncMissed(data));
      }
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });
  }

  //disconnect socket on logout
  if (logout.fulfilled.match(action)) {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  }
  return result;
};

export default socketMiddleware;
