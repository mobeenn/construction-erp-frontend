import api from "../api/axios";

export const getProgressUpdates = (project) =>
   api.get(`/progress-updates?project=${project}`);

export const createProgressUpdate = (data) => api.post("/progress-updates", data);

export const approveProgressUpdate = (id) =>
   api.put(`/progress-updates/${id}/approve`);

export const rejectProgressUpdate = (id) =>
   api.put(`/progress-updates/${id}/reject`);

export const getProgressDashboard = (projectId) =>
   api.get(`/progress/dashboard/${projectId}`);
