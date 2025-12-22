import api from "../lib/axios";

export interface Notification {
  id: number;
  title: string;
  message: string;
  targetUrl: string;
  isRead: boolean;
  createdAt: string;
}

export const notificationService = {
  getMyNotifications: async (userId: number) => {
    const response = await api.get<Notification[]>(`/notifications/user/${userId}`);
    return response.data;
  },

  getUnreadCount: async (userId: number) => {
    const response = await api.get<number>(`/notifications/user/${userId}/count`);
    return response.data;
  },

  markAsRead: async (id: number) => {
    await api.put(`/notifications/${id}/read`);
  },
};
