import api from './api.js';

export const fetchAlerts = async (params = {}) => {
  const response = await api.get('/alerts', { params });
  return response.data;
};
