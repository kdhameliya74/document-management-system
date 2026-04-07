import axios from "axios";
import ROUTES from "@/shared/utils/routes";

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Important for cookies
});

api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,

  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      if (status === 401) {
        if (localStorage.getItem("auth")) {
          console.warn("Unauthorized (401): Token missing or expired");
          window.location.href = ROUTES.LOGIN;
        }
      }

      if (status === 403) {
        console.error("Forbidden:", data.message);
      }

      return Promise.reject(error.response.data);
    }

    // Network issues
    if (error.request) {
      console.error("Network error");
      return Promise.reject({
        message: "Network error",
        status: 0,
      });
    }

    return Promise.reject(error);
  },
);

export default api;
