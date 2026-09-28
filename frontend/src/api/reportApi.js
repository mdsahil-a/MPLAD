import api from './api.js';

export const fetchReports = async () => {
  const response = await api.get('/reports');
  return response.data;
};
