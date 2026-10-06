import api from "../api/axios";

export const getVendors = () => api.get("/vendors");

export const createVendor = (data) => api.post("/vendors", data);
