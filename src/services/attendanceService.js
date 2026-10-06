import api from "../api/axios";

export const markAttendance = (data) => api.post("/attendance", data);

export const getDailyAttendance = (date) =>
   api.get(`/attendance/daily?date=${date}`);

export const getMonthlySummary = (employeeId, month, year) =>
   api.get(`/attendance/monthly/${employeeId}?month=${month}&year=${year}`);
