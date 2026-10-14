import axiosClient from '@/api/axiosClient';
import { ENDPOINTS } from '@/api/endpoints';

export const notificationService = {
  async getNotifications() {
    try {
      const response = await axiosClient.get(ENDPOINTS.NOTIFICATIONS.ROOT);
      return response.data;
    } catch {
      return { success: true, data: { notifications: [], unreadCount: 0 } };
    }
  },

  async markAsRead(id) {
    try {
      const response = await axiosClient.patch(ENDPOINTS.NOTIFICATIONS.MARK_READ(id));
      return response.data;
    } catch {
      return { success: true };
    }
  },

  async markAllAsRead() {
    try {
      const response = await axiosClient.patch(ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);
      return response.data;
    } catch {
      return { success: true };
    }
  },
};
