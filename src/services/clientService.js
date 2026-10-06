import api from "../api/axios";

export const getClients = (search = "") => api.get(`/clients?search=${search}`);

export const getClient = (id) => api.get(`/clients/${id}`);

export const createClient = (data) => api.post("/clients", data);

export const updateClient = (id, data) => api.put(`/clients/${id}`, data);

export const deleteClient = (id) => api.delete(`/clients/${id}`);
