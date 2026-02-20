import express from "express";
import { getPresignedUrls, confirmUpload, updateFile } from "../controllers/file.controller.js";
import { protect } from "../middlewares/auth.moddleware.js";

const router = express.Router();

router.post("/upload-urls", protect, getPresignedUrls);
router.post("/confirm", protect, confirmUpload);
router.patch("/:docId", protect, updateFile);

export default router;
