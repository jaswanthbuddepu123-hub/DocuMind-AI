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

export const getGraphStats = async () => {
  const response = await apiClient.get('/api/documents/graph-stats');
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

export const downloadDocument = async (id) => {
  const response = await apiClient.get(`/api/documents/${id}/download`);
  return response.data;
};

export const chatWithDocument = async (documentId, message) => {
  const response = await apiClient.post('/api/chat', { documentId, message });
  return response.data;
};

export const getChatHistory = async (documentId) => {
  const response = await apiClient.get(`/api/chat/${documentId}`);
  return response.data;
};

export const retryDocument = async (id) => {
  const response = await apiClient.post(`/api/documents/${id}/retry`);
  return response.data;
};

export const transformDocument = async (id, instruction) => {
  const response = await apiClient.post(`/api/documents/${id}/transform`, { instruction });
  return response.data;
};
