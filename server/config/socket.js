import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import jwt from "jsonwebtoken";
import { setOnline, setOffline, getRedisPub, getRedisSub } from "./redis.js";
import Notification from "../models/Notification.model.js";
import { DELIVERY_STATUS } from "../constants/Notification.js";

let io;
export const initSocket = async (httpServer) => {
  const pubClient = getRedisPub();
  const subClient = getRedisSub();

  pubClient.on("error", (err) => {
    console.error("[Redis] Client Error", err);
  });

  subClient.on("error", (err) => {
    console.error("[Redis] Sub Client Error", err);
  });

  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true,
    },
    pingTimeout: 10000,
    pingInterval: 25000,
  });

  io.adapter(createAdapter(pubClient, subClient));

  io.use((socket, next) => {
    const rawCookie = socket.handshake.headers.cookie;
    if (!rawCookie) return next(new Error("No cookie found"));
    const token = rawCookie.split("token=")[1];
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
    });

    socket.on("notification:ack", ({ id }) => {
      Notification.findByIdAndUpdate(id, {
        deliveryStatus: DELIVERY_STATUS.DELIVERED,
        deliveredAt: new Date(),
      }).exec();
    });

    socket.on("disconnect", async () => {
      console.log("[Socket] User disconnected", socket.id);
      await setOffline(socket.user.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket not initialized");
  }
  return io;
};
