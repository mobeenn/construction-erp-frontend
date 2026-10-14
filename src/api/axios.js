import axios from "axios";

const apiBase =
   (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/$/, "");

const api = axios.create({
   baseURL: apiBase,
   timeout: 15000,
});

// attach token automatically
api.interceptors.request.use((config) => {
   const token = localStorage.getItem("token");
   if (token) {
      config.headers.Authorization = `Bearer ${token}`;
   }
   return config;
});

api.interceptors.response.use(
   (response) => response,
   (error) => {
      if (error.response?.status === 401) {
         const path = window.location.pathname;
         if (path !== "/login") {
            localStorage.removeItem("token");
            window.location.assign("/login");
         }
      }
      return Promise.reject(error);
   },
);

export default api;
