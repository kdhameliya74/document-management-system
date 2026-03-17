import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import Redis from "ioredis";
import jwt from "jsonwebtoken";
import { setOnline, setOffline } from "./redis.js";
import Notification from "../models/Notification.model.js";

export const initSocket = async (httpServer) => {

    const pubClient = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD,
    });

    const subClient = pubClient.duplicate();

    pubClient.on("error", (err) => {
        console.error("[Redis] Client Error", err);
    });

    subClient.on("error", (err) => {
        console.error("[Redis] Sub Client Error", err);
    });

    const io = new Server(httpServer, {
        cors: {
            origin: process.env.CLIENT_URL,
            credentials: true,
        },
        pingTimeout: 10000,
        pingInterval: 25000,
    });

    io.adapter(createAdapter(pubClient, subClient));

    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) return next(new Error("Authentication error"));

        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) return next(new Error("Authentication error"));
            socket.user = user;
            next();
        });
    });

    io.on("connection", async (socket) => {
        console.log("[Socket] User connected", socket.id);

        await setOnline(socket.user.id, socket.id);
        socket.join(socket.user.id.toString());


        socket.on("notification:sync", async () => {
            const missed = await Notification.getUnread(socket.user.id);
            socket.emit("notification:synced", missed);
        })

        socket.on('notification:ack', ({ id }) => {
            Notification.findByIdAndUpdate(id, {
                isRead: true,
                readAt: new Date(),
            }).exec();
        });

        socket.on("disconnect", async () => {
            console.log("[Socket] User disconnected", socket.id);
            await setOffline(socket.user.id);
        });
    });

    return io;
}