import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import {
  getNotifications,
  markOneRead,
  markAllRead,
  bootstrapForUser,
} from "../controllers/notification.controller.js";

const router = express.Router();

router.get("/", protect, getNotifications);

router.patch("/:id/read", protect, markOneRead);

router.patch("/mark-all-read", protect, markAllRead);

router.get("/bootstrap", protect, bootstrapForUser);

export default router;
