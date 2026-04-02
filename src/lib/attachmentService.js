import api from './api';

const AttachmentService = {
  upload: async (taskId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('taskId', taskId);

    const response = await api.post('/attachments/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getForTask: async (taskId) => {
    const response = await api.get(`/attachments/task/${taskId}`);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/attachments/${id}`);
    return response.data;
  },
};

export default AttachmentService;
