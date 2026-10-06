import api from "../api/axios";

export const getProjects = () => api.get("/projects");

export const createProject = (data) => api.post("/projects", data);

export const updateProject = (id, data) => api.put(`/projects/${id}`, data);

export const deleteProject = (id) => api.delete(`/projects/${id}`);

export const updateRevenue = (id, data) =>
   api.put(`/projects/revenue/${id}`, data);

export const getProject = (id) => api.get(`/projects/${id}`);

export const getProjectDashboard = (id) => api.get(`/projects/${id}/dashboard`);

export const getProjectsFiltered = (params = "") =>
   api.get(`/projects${params}`);
