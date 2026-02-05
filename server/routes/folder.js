import express from "express";
import { createFolder, getFolders, updateDocument } from "../controllers/folderController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/create", protect, createFolder);
router.post("/all", protect, getFolders);
router.patch(`/:docId`, protect, updateDocument);

export default router;
