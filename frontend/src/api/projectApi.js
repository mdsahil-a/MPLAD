import api from './api.js';

export const fetchProjects = async (params = {}) => {
  const response = await api.get('/projects', { params });
  return response.data;
};

export const fetchProjectById = async (id) => {
  const response = await api.get(`/projects/${id}`);
  return response.data;
};
