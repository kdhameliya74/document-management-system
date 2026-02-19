import express from "express";
import { getPresignedUrls, confirmUpload } from "../controllers/file.controller.js";
import { protect } from "../middlewares/auth.moddleware.js";

const router = express.Router();

router.post("/upload-urls", protect, getPresignedUrls);
router.post("/confirm", protect, confirmUpload);

router.post("/sample-upload", getPresignedUrls);

export default router;
