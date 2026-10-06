// import api from "../api/axios";

// export const getPurchaseOrders = () => api.get("/purchase-orders");

// export const createPurchaseOrder = (data) => api.post("/purchase-orders", data);

// export const approvePurchaseOrder = (id) =>
//    api.put(`/purchase-orders/approve/${id}`);

// export const getPOs = () => api.get("/purchase-orders");

// export const createPO = (data) => api.post("/purchase-orders", data);

// export const approvePO = (id) => api.put(`/purchase-orders/approve/${id}`);

import api from "../api/axios";

export const getPurchaseOrders = () => api.get("/purchase-orders");

export const createPurchaseOrder = (data) => api.post("/purchase-orders", data);

export const approvePurchaseOrder = (id) =>
   api.put(`/purchase-orders/approve/${id}`);
