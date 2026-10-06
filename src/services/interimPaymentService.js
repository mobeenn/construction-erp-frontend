import api from "../api/axios";

export const getInterimPayments = (project) =>
   api.get(`/interim-payments?project=${project}`);

export const createInterimPayment = (data) => api.post("/interim-payments", data);

export const updateInterimPaymentStatus = (id, status) =>
   api.put(`/interim-payments/${id}/status`, { status });

export const deleteInterimPayment = (id) => api.delete(`/interim-payments/${id}`);
