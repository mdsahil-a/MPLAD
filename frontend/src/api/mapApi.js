import api from './api.js';

export const fetchMapData = async () => {
  const response = await api.get('/map');
  return response.data;
};
