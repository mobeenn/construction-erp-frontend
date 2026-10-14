import api from "./axios";

export const getDashboardAnalyticsApi = () => api.get("/dashboard/analytics");
