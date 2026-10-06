import api from "../api/axios";

export const getBudgets = (project = "") => api.get(`/budgets?project=${project}`);

export const createBudget = (data) => api.post("/budgets", data);

export const activateBudget = (id) => api.put(`/budgets/${id}/activate`);

export const deleteBudget = (id) => api.delete(`/budgets/${id}`);

export const getBudgetAnalysis = (projectId) =>
   api.get(`/budgets/analysis/${projectId}`);
