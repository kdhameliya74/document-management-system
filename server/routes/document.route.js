import express from "express";
import { protect } from "../middlewares/auth.moddleware.js";
import { validateId } from "../middlewares/validateId.middleware.js";
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
  permanentDelete,
  moveDocument,
  shareDocument,
} from "../controllers/document.controller.js";

const router = express.Router();

//List documents
router.get("/", protect, validateId("parentId", "query"), listDocuments);
router.get("/trash", protect, validateId("parentId", "query"), listTrash);

//Upload documents
router.post("/upload-urls", protect, getPresignedUrls);
router.post("/upload-confirm", protect, confirmUpload);

//Create folder
router.post("/folders", protect, createFolder);

//Get document by id
router.get("/:id", protect, validateId("id"), getDocumentById);

//Update document
router.patch("/:id", protect, validateId("id"), updateDocument);

//Delete document
router.delete("/:id", protect, validateId("id"), trashDocument);
router.delete("/:id/permenant", protect, validateId("id"), permanentDelete);

//Restore document
router.patch("/:id/restore", protect, validateId("id"), restoreDocument);

//Share document
router.post("/:id/share", protect, validateId("id"), shareDocument);

//Move document
router.patch("/:id/move", protect, validateId("id"), moveDocument);

export default router;
