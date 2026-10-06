import api from "../api/axios";

export const getActivities = (params = "") => api.get(`/activities${params}`);

export const createActivity = (data) => api.post("/activities", data);

export const updateActivity = (id, data) => api.put(`/activities/${id}`, data);

export const deleteActivity = (id) => api.delete(`/activities/${id}`);
