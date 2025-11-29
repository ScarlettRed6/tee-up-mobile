import api from './axiosInstance';

export async function fetchNotificationsApi() {
  const response = await api.get('/notifications');
  return response.data;
}

export async function markNotificationAsReadApi(notificationId) {
  const response = await api.patch(`/notifications/${notificationId}/read`);
  return response.data;
}

export async function markAllNotificationsAsReadApi() {
  const response = await api.patch('/notifications/read-all');
  return response.data;
}

