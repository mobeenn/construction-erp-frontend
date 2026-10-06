import api from "./axios";

export const getUsersApi = (params) => api.get("/users", { params });

export const createUserApi = (data) => api.post("/auth/create-user", data);

export const updateUserApi = (id, data) => api.put(`/users/${id}`, data);

export const deleteUserApi = (id) => api.delete(`/users/${id}`);

export const getUserStatsApi = () => api.get("/users/stats");
