import api from './api';

const CommentService = {
  create: async (taskId, content, mentions) => {
    const response = await api.post('/comments', {
      taskId,
      content,
      mentions,
    });
    return response.data;
  },

  getForTask: async (taskId) => {
    const response = await api.get(`/comments/task/${taskId}`);
    return response.data;
  },

  update: async (id, content, mentions) => {
    const response = await api.patch(`/comments/${id}`, {
      content,
      mentions,
    });
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/comments/${id}`);
    return response.data;
  },
};

export default CommentService;
