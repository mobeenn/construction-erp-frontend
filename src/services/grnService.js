// import api from "../api/axios";

// // GET purchase orders (ONLY draft/approved for dropdown)
// export const getPurchaseOrders = () => api.get("/purchase-orders");

// // CREATE GRN
// export const createGRN = (data) => api.post("/grns", data);

import api from "../api/axios";

export const getPurchaseOrders = () => api.get("/purchase-orders");

export const getGRNs = () => api.get("/grns");

export const createGRN = (data) => api.post("/grns", data);
