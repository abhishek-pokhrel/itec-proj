import api from './api';

const NotificationService = {
  getAll: async (unreadOnly = false) => {
    const response = await api.get('/notifications', {
      params: { unreadOnly },
    });
    return response.data;
  },

  markAsRead: async (id) => {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.patch('/notifications/read-all');
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  },

  clearAll: async () => {
    const response = await api.delete('/notifications/clear-all');
    return response.data;
  },
};

export default NotificationService;
