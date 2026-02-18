import express from "express";
import { getPresignedUrls, confirmUpload } from "../controllers/fileController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/upload-urls", protect, getPresignedUrls);
router.post("/confirm", protect, confirmUpload);

router.post("/sample-upload", getPresignedUrls);

export default router;
