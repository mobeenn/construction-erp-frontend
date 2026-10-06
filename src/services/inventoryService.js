import api from "../api/axios";

export const getInventory = (params) => api.get("/inventory", { params });

export const createInventory = (data) => api.post("/inventory", data);

export const stockIn = (id, data) => api.put(`/inventory/stock-in/${id}`, data);

export const stockOut = (id, data) =>
   api.put(`/inventory/stock-out/${id}`, data);

export const transferStock = (data) => api.post("/inventory/transfer", data);

export const getTransfers = () => api.get("/inventory/transfers");

export const returnMaterial = (data) => api.post("/inventory/return", data);

export const getReturns = () => api.get("/inventory/returns");

export const requestAdjustment = (data) => api.post("/inventory/adjust", data);

export const getAdjustments = () => api.get("/inventory/adjustments");

export const reviewAdjustment = (id, action) =>
   api.put(`/inventory/adjustments/${id}/review`, { action });

export const getStockLedger = (inventoryId) =>
   api.get("/inventory/ledger", { params: { inventory: inventoryId } });

export const getStockMovements = () => api.get("/inventory/movements");

export const getInventoryValuation = () => api.get("/inventory/valuation");

export const getLowStockAlerts = () => api.get("/inventory/low-stock");

export const getMaterialConsumption = (params) =>
   api.get("/inventory/consumption", { params });
