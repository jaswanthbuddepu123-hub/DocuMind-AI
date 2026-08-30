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

export const updateProfile = async (name, phone_number, avatarFile) => {
  const formData = new FormData();
  if (name) formData.append('name', name);
  if (phone_number !== undefined) formData.append('phone_number', phone_number);
  if (avatarFile) formData.append('avatar', avatarFile);

  const response = await apiClient.put('/api/auth/me', formData);
  return response.data;
};
