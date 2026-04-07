import express from "express";
import { protect } from "../../middlewares/auth.middleware.js";
import {
  getNotifications,
  markOneRead,
  markAllRead,
} from "./notification.controller.js";

const router = express.Router();

router.get("/", protect, getNotifications);

router.patch("/:id/read", protect, markOneRead);

router.patch("/read-all", protect, markAllRead);

export default router;
