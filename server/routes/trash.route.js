import express from "express";
import { getTrashedDocs, restoreDocument } from "../controllers/trash.controller.js";
import { protect } from "../middlewares/auth.moddleware.js";

const router = express.Router();

router.get("/trash", protect, getTrashedDocs);
router.patch("/trash/:docId/restore", protect, restoreDocument);

export default router;
