import api from "../api/axios";

// Get my notifications
export const getMyNotifications = (params) =>
   api.get("/notifications", { params });

// Get unread count
export const getUnreadCount = () =>
   api.get("/notifications/unread-count");

// Mark notification as read
export const markAsRead = (id) =>
   api.put(`/notifications/${id}/read`);

// Mark all notifications as read
export const markAllAsRead = () =>
   api.put("/notifications/mark-all-read");

// Delete a notification
export const deleteNotification = (id) =>
   api.delete(`/notifications/${id}`);
