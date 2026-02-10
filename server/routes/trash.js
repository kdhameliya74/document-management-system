import express from "express";
import { getTrashedDocs, restoreDocument } from "../controllers/trashController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/trash", protect, getTrashedDocs);
router.patch("/trash/:docId/restore", protect, restoreDocument);

export default router;
