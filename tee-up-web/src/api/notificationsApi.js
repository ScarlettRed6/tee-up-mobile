import axiosInstance from './axiosInstance';

/**
 * Fetch all notifications for the current user (auth required).
 * Backend: GET /notifications
 */
export const getNotifications = async () => {
  const response = await axiosInstance.get('/notifications');
  return response.data;
};

/**
 * Mark a single notification as read.
 * Backend: PATCH /notifications/:notification_id/read
 */
export const markNotificationAsRead = async (notificationId) => {
  const response = await axiosInstance.patch(`/notifications/${notificationId}/read`);
  return response.data;
};

/**
 * Mark all notifications as read.
 * Backend: PATCH /notifications/read-all
 */
export const markAllNotificationsAsRead = async () => {
  const response = await axiosInstance.patch('/notifications/read-all');
  return response.data;
};
