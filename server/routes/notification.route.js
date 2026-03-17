import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { getNotifications, markOneRead, bootstrapForUser } from "../controllers/notification.controller.js";

const router = express.Router();

router.get("/", protect, getNotifications);

router.patch("/:id/read", protect, markOneRead);

router.get("/bootstrap", protect, bootstrapForUser);

export default router;