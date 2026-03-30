import apiClient from './client';
import { Assignment } from '../types';

export const assignmentsApi = {
  list: async (params?: { stream?: string; status?: string; page?: number; limit?: number }) => {
    const { data } = await apiClient.get('/assignments', { params });
    return data as Assignment[];
  },

  get: async (id: string) => {
    const { data } = await apiClient.get(`/assignments/${id}`);
    return data as Assignment;
  },

  create: async (payload: Partial<Assignment>) => {
    const { data } = await apiClient.post('/assignments', payload);
    return data as Assignment;
  },

  update: async (id: string, payload: Partial<Assignment>) => {
    const { data } = await apiClient.put(`/assignments/${id}`, payload);
    return data as Assignment;
  },

  delete: async (id: string) => {
    await apiClient.delete(`/assignments/${id}`);
  },
};
