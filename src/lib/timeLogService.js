import api from './api';

const TimeLogService = {
  log: async (taskId, duration, note, date) => {
    const response = await api.post('/timelogs', {
      taskId,
      duration,
      note,
      date,
    });
    return response.data;
  },

  getForTask: async (taskId) => {
    const response = await api.get(`/timelogs/task/${taskId}`);
    return response.data;
  },

  getUserStats: async () => {
    const response = await api.get('/timelogs/user/stats');
    return response.data;
  },

  update: async (id, duration, note, date) => {
    const response = await api.patch(`/timelogs/${id}`, {
      duration,
      note,
      date,
    });
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/timelogs/${id}`);
    return response.data;
  },
};

export default TimeLogService;
