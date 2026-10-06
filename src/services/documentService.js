import api from "../api/axios";

// Get all documents with optional filters
export const getDocuments = (params) => api.get("/documents", { params });

// Get documents by entity type and ID
export const getDocumentsByEntity = (entityType, entityId) =>
   api.get(`/documents/entity/${entityType}/${entityId}`);

// Get a single document
export const getDocument = (id) => api.get(`/documents/${id}`);

// Upload a document with file
export const uploadDocument = (formData) =>
   api.post("/documents", formData, {
      headers: { "Content-Type": "multipart/form-data" },
   });

// Create a document without file
export const createDocument = (data) => api.post("/documents/without-file", data);

// Update a document
export const updateDocument = (id, data) => api.put(`/documents/${id}`, data);

// Soft delete a document
export const deleteDocument = (id) => api.delete(`/documents/${id}`);

// Hard delete a document (permanent)
export const hardDeleteDocument = (id) => api.delete(`/documents/${id}/permanent`);

// Download a document
export const downloadDocument = (id) => api.get(`/documents/${id}/download`, { responseType: "blob" });
