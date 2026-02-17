import express from "express";
import { getPresignedUrl, confirmUpload } from "../controllers/fileController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/upload-url", protect, getPresignedUrl);
router.post("/confirm", protect, confirmUpload);

export default router;
