import api from "@/utils/api";
import axios from "axios";

const fileSystemAPI = {
  getAll: async (parentId) => {
    const response = await api.get("/documents", { params: { parentId } });
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

  getTrash: async () => {
    const response = await api.get("/documents/trash");
    return response.data;
  },

  restoreDocument: async (docId) => {
    const response = await api.patch(`/documents/${docId}/restore`);
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
};

export default fileSystemAPI;
