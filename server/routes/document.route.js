import express from "express";
import { protect } from "../middlewares/auth.moddleware.js";
import {
  listDocuments,
  createFolder,
  getDocumentById,
  updateDocument,
  trashDocument,
  listTrash,
  restoreDocument,
  getPresignedUrls,
  confirmUpload,
  permenantDelete,
} from "../controllers/document.controller.js";

const router = express.Router();

//List documents
router.get("/", protect, listDocuments);
router.get("/trash", protect, listTrash);

//Upload documents
router.post("/upload-urls", protect, getPresignedUrls);
router.post("/upload-confirm", protect, confirmUpload);

//Create folder
router.post("/folders", protect, createFolder);

//Get document by id
router.get("/:id", protect, getDocumentById);

//Update document
router.patch("/:id", protect, updateDocument);

//Delete document
router.patch("/:id", protect, trashDocument);
router.delete("/:id", protect, permenantDelete);

//Restore document
router.patch("/:id/restore", protect, restoreDocument);

export default router;
