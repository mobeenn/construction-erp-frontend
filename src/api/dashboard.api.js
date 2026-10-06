import api from "./axios";

export const getDashboardApi = () => api.get("/dashboard");

export const getDashboardAnalyticsApi = () => api.get("/dashboard/analytics");
