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
} from "../controllers/document.controller.js";

const router = express.Router();

// ─── S3 Upload flow ───────────────────────────────────────────────────────────
// POST /api/documents/upload-urls      → generate presigned PUT URLs for S3
router.post("/upload-urls", protect, getPresignedUrls);

// POST /api/documents/upload-confirm   → record file after successful S3 upload
router.post("/upload-confirm", protect, confirmUpload);

// ─── Folder creation ─────────────────────────────────────────────────────────
// POST /api/documents/folders          → create a new folder
router.post("/folders", protect, createFolder);

// ─── Trash ───────────────────────────────────────────────────────────────────
// GET  /api/documents/trash            → list top-level trashed items
router.get("/trash", protect, listTrash);

// ─── Browse ──────────────────────────────────────────────────────────────────
// GET  /api/documents?parent=<id>      → list folders + files inside a folder
router.get("/", protect, listDocuments);

// ─── Single-document operations ───────────────────────────────────────────────
// GET    /api/documents/:id            → fetch a single document
router.get("/:id", protect, getDocumentById);

// PATCH  /api/documents/:id            → rename, recolor, star, etc.
router.patch("/:id", protect, updateDocument);

// DELETE /api/documents/:id            → soft-delete (move to trash)
router.delete("/:id", protect, trashDocument);

// PATCH  /api/documents/:id/restore    → restore from trash
router.patch("/:id/restore", protect, restoreDocument);

export default router;
