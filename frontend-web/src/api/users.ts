import apiClient from './client';

export const usersApi = {
  getMe: async () => {
    const { data } = await apiClient.get('/users/me');
    return data;
  },

  updateProfile: async (payload: {
    full_name?: string;
    email?: string;
    exam_stream?: string;
    preferred_language?: string;
  }) => {
    const { data } = await apiClient.put('/users/me', null, { params: payload });
    return data;
  },

  uploadProfilePhoto: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await apiClient.post('/uploads/profile-photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  getById: async (id: string) => {
    const { data } = await apiClient.get(`/users/${id}`);
    return data;
  },

  toggleActive: async (id: string) => {
    const { data } = await apiClient.patch(`/users/${id}/toggle-active`);
    return data;
  },
};
