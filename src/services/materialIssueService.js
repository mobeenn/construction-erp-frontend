import api from "../api/axios";

export const getMaterialIssues = () => api.get("/material-issues");

export const createMaterialIssue = (data) => api.post("/material-issues", data);
