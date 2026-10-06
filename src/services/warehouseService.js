import api from "../api/axios";

export const getWarehouses = () => api.get("/warehouses");

export const createWarehouse = (data) => api.post("/warehouses", data);

export const updateWarehouse = (id, data) => api.put(`/warehouses/${id}`, data);

export const deleteWarehouse = (id) => api.delete(`/warehouses/${id}`);
