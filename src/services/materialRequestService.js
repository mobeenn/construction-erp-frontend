import api from "../api/axios";

// Get all requests

export const getMaterialRequests = () => api.get("/material-requests");

// Create request

export const createMaterialRequest = (data) =>
   api.post("/material-requests", data);

// Approve request

export const approveMaterialRequest = (id) =>
   api.put(`/material-requests/approve/${id}`);

// Reject request

export const rejectMaterialRequest = (id) =>
   api.put(`/material-requests/reject/${id}`);
