import api from "@/utils/api";

const fileSystemAPI = {
  // create new document
  createFolder: async (folder) => {
    const response = await api.post("/folders/create", folder);
    return response.data;
  },
  getAll: async (parentId) => {
    const response = await api.get("/folders/all", { params: { parent: parentId } });
    return response.data;
  },
  updateDocument: async (docId, payload) => {
    const response = await api.patch(`/folders/${docId}`, { ...payload });
    return response.data;
  },
  deleteDocument: async (docId) => {
    const response = await api.delete(`/folders/${docId}`);
    return response.data;
  },
  getTrash: async (parentId) => {
    const response = await api.get("/folders/trash", { params: { parent: parentId } });
    return response.data;
  },
  restoreDocument: async (docId) => {
    const response = await api.patch(`/folders/trash/${docId}/restore`);
    return response.data;
  },
};

export default fileSystemAPI;
