import api from "@/utils/api";
import axios from "axios";

const fileSystemAPI = {
  // ── Browse ──────────────────────────────────────────────────────────────────
  /** List all documents (folders + files) inside a parent folder */
  getAll: async (parentId) => {
    const response = await api.get("/documents", { params: { parent: parentId } });
    return response.data;
  },

  // ── Folder ──────────────────────────────────────────────────────────────────
  /** Create a new folder */
  createFolder: async (folder) => {
    const response = await api.post("/documents/folders", folder);
    return response.data;
  },

  // ── Document mutations ──────────────────────────────────────────────────────
  /** Rename, recolor, star, or update any allowed field */
  updateDocument: async (docId, payload) => {
    const response = await api.patch(`/documents/${docId}`, { ...payload });
    return response.data;
  },

  /** Soft-delete (move to trash) */
  deleteDocument: async (docId) => {
    const response = await api.delete(`/documents/${docId}`);
    return response.data;
  },

  // ── Trash ───────────────────────────────────────────────────────────────────
  /** List top-level trashed documents */
  getTrash: async () => {
    const response = await api.get("/documents/trash");
    return response.data;
  },

  /** Restore a document (and its children) from trash */
  restoreDocument: async (docId) => {
    const response = await api.patch(`/documents/${docId}/restore`);
    return response.data;
  },

  // ── File upload (S3 presigned flow) ─────────────────────────────────────────
  /** Get presigned S3 PUT URLs for direct browser-to-S3 upload */
  getPresignedUrls: async (files) => {
    const response = await api.post("/documents/upload-urls", files);
    return response.data;
  },

  /** Confirm upload success and persist file record in the database */
  confirmUpload: async (fileData) => {
    const response = await api.post("/documents/upload-confirm", fileData);
    return response.data;
  },

  /** Direct S3 PUT (bypasses our API server) */
  uploadFileOnS3: async (url, file) => {
    const response = await axios.put(url, file, {
      headers: { "Content-Type": file.type },
    });
    return response;
  },
};

export default fileSystemAPI;
