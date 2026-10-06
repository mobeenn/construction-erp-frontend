import api from "../api/axios";

export const getContracts = (params = "") => api.get(`/contracts${params}`);

export const getContract = (id) => api.get(`/contracts/${id}`);

export const createContract = (data) => api.post("/contracts", data);

export const updateContract = (id, data) => api.put(`/contracts/${id}`, data);

export const deleteContract = (id) => api.delete(`/contracts/${id}`);
