import api from "../api/axios";

export const getProfitLoss = () => api.get("/profit-loss");
