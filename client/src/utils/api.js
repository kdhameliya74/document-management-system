import axios from 'axios';
import Cookies from 'js-cookie';
import ROUTES from '@/utils/routes';

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies
});

// Request interceptor - Add JWT token to headers
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage (primary) or cookies (fallback)
    const token = localStorage.getItem('token') || Cookies.get('token');
    console.log('TOKEN from API', token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
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
  }
);


export default api;
