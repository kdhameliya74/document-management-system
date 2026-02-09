import express from "express";
import {
  createFolder,
  getFolders,
  deleteDocument,
  updateDocument,
} from "../controllers/folderController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/create", protect, createFolder);
router.get("/all", protect, getFolders);
router.patch(`/:docId`, protect, updateDocument);
router.delete("/:docId", protect, deleteDocument);

export default router;
