import api from "../api/axios";

export const getDailyReports = (params = {}) =>
   api.get("/daily-reports", { params });

export const createDailyReport = (data, attachments = []) => {
   const formData = new FormData();
   formData.append("report", JSON.stringify(data));
   attachments.forEach((file) => formData.append("attachments", file));
   return api.post("/daily-reports", formData);
};

export const approveDailyReport = (id) =>
   api.put(`/daily-reports/${id}/approve`);

export const rejectDailyReport = (id) =>
   api.put(`/daily-reports/${id}/reject`);

export const downloadDailyReportAttachment = (url) =>
   api.get(`/daily-reports/files/${encodeURIComponent(url.split("/").pop())}`, {
      responseType: "blob",
   });
