import api from "../api/axios";

export const getExpenses = () => api.get("/expenses");

export const createExpense = (data) => api.post("/expenses", data);
