import express from "express";
import { getPresignedUrl, confirmUpload } from "../controllers/fileController.js";
import { protect } from "../middleware/auth.js";
import s3Client from "../config/s3.js";
import { GetObjectCommand, HeadBucketCommand, HeadObjectCommand } from "@aws-sdk/client-s3";

const router = express.Router();

router.post("/upload-url", protect, getPresignedUrl);
router.post("/confirm", protect, confirmUpload);

router.post("/sample-upload", getPresignedUrl);

export default router;
