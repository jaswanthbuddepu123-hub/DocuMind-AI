import apiClient from './apiClient';

export const login = async (email, password) => {
  const response = await apiClient.post('/api/auth/login', { email, password });
  return response.data;
};

export const register = async (name, email, password) => {
  const response = await apiClient.post('/api/auth/register', { name, email, password });
  return response.data;
};

export const getMe = async () => {
  const response = await apiClient.get('/api/auth/me');
  return response.data;
};
