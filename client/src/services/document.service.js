import api from "@/utils/api";
import axios from "axios";

const DocumentService = {
  getAll: async (payload) => {
    const response = await api.get("/documents", { params: payload });
    return response.data;
  },

  createFolder: async (folder) => {
    const response = await api.post("/documents/folders", folder);
    return response.data;
  },

  updateDocument: async (docId, payload) => {
    const response = await api.patch(`/documents/${docId}`, { ...payload });
    return response.data;
  },

  deleteDocument: async (docId) => {
    const response = await api.delete(`/documents/${docId}`);
    return response.data;
  },

  restoreDocument: async (docId) => {
    const response = await api.patch(`/documents/${docId}/restore`);
    return response.data;
  },

  permenantDocument: async (docId) => {
    const response = await api.delete(`/documents/${docId}/permenant`);
    return response.data;
  },

  getPresignedUrls: async (files) => {
    const response = await api.post("/documents/upload-urls", files);
    return response.data;
  },

  confirmUpload: async (fileData) => {
    const response = await api.post("/documents/upload-confirm", fileData);
    return response.data;
  },

  uploadFileOnS3: async (url, file) => {
    const response = await axios.put(url, file, {
      headers: { "Content-Type": file.type },
    });
    return response;
  },

  moveDocument: async (docId, parentId) => {
    const response = await api.patch(`/documents/${docId}/move`, { parentId });
    return response.data;
  },

  shareDocument: async (docId, collaborators) => {
    const response = await api.post(`/documents/${docId}/share`, { collaborators });
    return response.data;
  },

  getDownloadUrl: async (docId) => {
    const response = await api.get(`/documents/${docId}/download-url`);
    return response.data;
  },
};

export default DocumentService;
