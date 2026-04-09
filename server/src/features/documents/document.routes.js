import express from "express";
import { protect } from "../../middlewares/auth.middleware.js";
import { validateId } from "../../middlewares/validateId.middleware.js";
import { checkPermission } from "../../middlewares/permission.middleware.js";
import {
  listDocuments,
  createFolder,
  getDocumentById,
  updateDocument,
  trashDocument,
  restoreDocument,
  getPresignedUrls,
  confirmUpload,
  permanentDelete,
  moveDocument,
  shareDocument,
  getDocumentURL,
  downloadDocument,
  searchDocuments,
  removeCollaborator,
  summarizeDocument,
  suggestDocumentName,
} from "./document.controller.js";

const router = express.Router();

//Search documents
router.get("/search/", protect, searchDocuments);

//List documents
router.get("/", protect, validateId("parentId", "query"), listDocuments);

//Upload documents
router.post("/upload-urls", protect, getPresignedUrls);
router.post("/upload-confirm", protect, confirmUpload);

//Create folder
router.post("/folders", protect, createFolder);

//Get document by id
router.get("/:id", protect, validateId("id"), checkPermission("view"), getDocumentById);

//Update document
router.patch("/:id", protect, validateId("id"), checkPermission("edit"), updateDocument);

//Delete document
router.delete("/:id", protect, validateId("id"), checkPermission("trash"), trashDocument);
router.delete(
  "/:id/permenant",
  protect,
  validateId("id"),
  checkPermission("delete"),
  permanentDelete,
);

//Restore document
router.patch("/:id/restore", protect, validateId("id"), checkPermission("edit"), restoreDocument);

//Share document
router.post("/:id/share", protect, validateId("id"), checkPermission("share"), shareDocument);
router.delete(
  "/:id/share/:userId",
  protect,
  validateId("id"),
  checkPermission("share"),
  removeCollaborator,
);

//Move document
router.patch("/:id/move", protect, validateId("id"), checkPermission("move"), moveDocument);

//Get preview url
router.get("/:id/url", protect, validateId("id"), checkPermission("download"), getDocumentURL);

//Download document
router.get(
  "/:id/download",
  protect,
  validateId("id"),
  checkPermission("download"),
  downloadDocument,
);

// AI Summarize document
router.post(
  "/:id/summarize",
  protect,
  validateId("id"),
  checkPermission("edit"),
  summarizeDocument,
);

// AI Smart Rename
router.post(
  "/:id/suggest-name",
  protect,
  validateId("id"),
  checkPermission("edit"),
  suggestDocumentName,
);

export default router;
