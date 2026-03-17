import { io } from "socket.io-client";
import { login, logout } from "../store/authSlice";

let socket = null;

const socketMiddleware = (store) => (next) => (action) => {
    const result = next(action);
    if (!login.fulfilled.match(action)) {
        if (!socket) {
            const socketUrl = import.meta.env.VITE_API_BASE_URL;
            socket = io(socketUrl, {
                withCredentials: true,
                reconnectionAttempts: 10,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 5000
            });

            console.log("Socket URL:", socket);
            socket.on("connect", () => {
                console.log("Socket connected");
                socket.emit('notifications:sync');
            });

            socket.on("disconnect", () => {
                console.log("Socket disconnected");
            });

        }
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
