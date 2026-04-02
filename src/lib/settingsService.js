import api from './api';

const SettingsService = {
  getSettings: async () => {
    const response = await api.get('/settings/settings');
    return response.data;
  },

  updateSettings: async (settings) => {
    const response = await api.patch('/settings/settings', settings);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/settings/profile');
    return response.data;
  },

  updateProfile: async (name, email) => {
    const response = await api.patch('/settings/profile', {
      name,
      email,
    });
    return response.data;
  },
};

export default SettingsService;
