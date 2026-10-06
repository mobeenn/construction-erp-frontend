import api from "./axios";

export const loginApi = (data) => api.post("/auth/login", data);
export const meApi = () => api.get("/auth/me");
export const getPermissionPoliciesApi = () => api.get("/permissions");
export const updatePermissionPoliciesApi = (policies) => api.put("/permissions", { policies });
