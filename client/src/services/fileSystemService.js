import api from "@/utils/api";

const fileSystemAPI = {
  // create new document
  createFolder: async (folder) => {
    const response = await api.post("/folders/create", folder);
    return response.data;
  },
  getAll: async (parentId) => {
    const response = await api.post("/folders/all", { parent: parentId });
    return response.data;
  },
};

export default fileSystemAPI;
