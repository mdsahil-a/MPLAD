import api from './api.js';

export const fetchDashboardData = async () => {
  const response = await api.get('/dashboard');
  return response.data;
};
