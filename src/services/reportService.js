import api from "../api/axios";

export const getAttendanceReport = () => api.get("/reports/attendance");

export const getExpenseReport = () => api.get("/reports/expenses");

export const getInventoryReport = () => api.get("/reports/inventory");

export const getProjectReport = () => api.get("/reports/projects");
