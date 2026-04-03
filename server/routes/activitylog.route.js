import { Router } from "express";
import { getActivityLogs } from "../controllers/activityLog.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { validateId } from "../middlewares/validate.middleware.js";

const router = Router();

router.get("/", protect, validateId("id", "query"), getActivityLogs);

export default router;