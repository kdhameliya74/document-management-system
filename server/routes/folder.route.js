import express from "express";
import {
  createFolder,
  getFolders,
  deleteDocument,
  updateDocument,
} from "../controllers/folder.controller.js";
import { protect } from "../middlewares/auth.moddleware.js";

const router = express.Router();

router.post("/create", protect, createFolder);
router.get("/all", protect, getFolders);
router.patch(`/:docId`, protect, updateDocument);
router.delete("/:docId", protect, deleteDocument);

export default router;
