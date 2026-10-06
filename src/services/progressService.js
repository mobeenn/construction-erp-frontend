import api from "../api/axios";

export const getProgressReports = (project) =>
   api.get(`/progress?project=${project}`);

export const createProgressReport = (data) => api.post("/progress", data);
