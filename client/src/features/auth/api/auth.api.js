import api from "@/shared/utils/api";

// Auth API endpoints
const authAPI = {
  // Register new user
  register: async (userData) => {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },

  // Login user
  login: async (credentials) => {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  },

  // Logout user
  logout: async () => {
    const response = await api.post("/auth/logout");
    return response.data;
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },

  // Update user details
  updateProfile: async (userData) => {
    const response = await api.put("/auth/updatedetails", userData);
    return response.data;
  },

  // Change password
  changePassword: async (passwordData) => {
    const response = await api.put("/auth/updatepassword", passwordData);
    return response.data;
  },

  // Get avatar upload URL
  getAvatarUploadUrl: async (fileName) => {
    const response = await api.get(`/auth/avatar-upload-url?fileName=${fileName}`);
    return response.data;
  },
};

export default authAPI;
