import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import chalk from "chalk";

import connectDB from "./config/database.js";
import { initSocket } from "./config/socket.js";
import { initRedis } from "./config/redis.js";
import { errorHandler, notFound } from "./middlewares/error.middleware.js";

// Routes
import authRoutes from "./routes/auth.route.js";
import documentRoutes from "./routes/document.route.js";
import notificationRoutes from "./routes/notification.route.js";

// Load env
dotenv.config();

const startServer = async () => {
  try {
    await connectDB();
    console.log("✅ MongoDB is ready");
    await initRedis();
    console.log("✅ Redis is ready");

    const app = express();

    // Security middleware
    app.use(helmet());

    // Rate limiting
    app.use(
      "/api/",
      rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100,
        message: "Too many requests from this IP, please try again later.",
      }),
    );

    app.use(mongoSanitize());

    // Body parser
    app.use(express.json({ limit: "10mb" }));
    app.use(express.urlencoded({ extended: true, limit: "10mb" }));

    app.use(cookieParser());

    // CORS
    app.use(
      cors({
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        credentials: true,
      }),
    );

    // Health check
    app.get("/api/health", (req, res) => {
      res.json({
        success: true,
        message: "Server is running",
        timestamp: new Date().toISOString(),
      });
    });

    // Routes
    app.use("/api/auth", authRoutes);
    app.use("/api/documents", documentRoutes);
    app.use("/api/notifications", notificationRoutes);

    // Error handlers
    app.use(notFound);
    app.use(errorHandler);

    const httpServer = http.createServer(app);

    await initSocket(httpServer);
    console.log("✅ Socket is ready");

    const PORT = process.env.PORT || 5000;
    const server = httpServer.listen(PORT, () => {
      const line = (key, value) => chalk.cyan(key.padEnd(13)) + chalk.white(": ") + chalk.green(value);
      console.log(`
${chalk.blue("==================================================")}
${chalk.bold.green("   SERVER STARTED ✅")}
${chalk.blue("--------------------------------------------------")}
${line("Port", PORT)}
${line("Environment", process.env.NODE_ENV || "development")}
${line("Security", "Enabled")}
${line("Socket.IO", "Active")}
${line("Health", `http://localhost:${PORT}/api/health`)}
${chalk.blue("==================================================")}
      `);
    });

    // Handle unhandled rejections
    process.on("unhandledRejection", (err) => {
      console.error("❌ Unhandled Rejection:", err.message);
      server.close(() => process.exit(1));
    });
  } catch (err) {
    console.error("❌ Startup error:", err);
    process.exit(1);
  }
};

startServer();
