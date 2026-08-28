import apiClient from './apiClient';

export const uploadDocument = async (file, onProgress) => {
  const formData = new FormData();
  formData.append('document', file);

  const response = await apiClient.post('/api/documents/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percentCompleted);
      }
    },
  });
  return response.data;
};

export const getStats = async () => {
  const response = await apiClient.get('/api/documents/stats');
  return response.data;
};

export const listDocuments = async (params = {}) => {
  const response = await apiClient.get('/api/documents', { params });
  return response.data;
};

export const getDocument = async (id) => {
  const response = await apiClient.get(`/api/documents/${id}`);
  return response.data;
};

export const updateDocumentResult = async (id, data) => {
  const response = await apiClient.patch(`/api/documents/${id}`, data);
  return response.data;
};

export const deleteDocument = async (id) => {
  const response = await apiClient.delete(`/api/documents/${id}`);
  return response.data;
};
