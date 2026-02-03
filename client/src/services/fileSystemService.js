import api from "@/utils/api";

const fileSystemAPI = {
  // create new folder
  createFolder: async (folder) => {
    const response = await api.post("/folders/create", folder);
    return response.data;
  },
  getAll: async (parentId) => {
    const response = await api.post("/folders/all", parentId);
    return response.data;
  },
};

export default fileSystemAPI;
