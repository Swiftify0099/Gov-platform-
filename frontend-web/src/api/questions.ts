import apiClient from './client';
import { Question } from '../types';

export interface BulkUploadResponse {
  created: number;
  failed: number;
  errors: string[];
}

export const questionsApi = {
  list: async (params?: { page?: number; limit?: number; topic?: string; difficulty?: string }) => {
    const { data } = await apiClient.get('/questions', { params });
    return data;
  },

  get: async (id: string) => {
    const { data } = await apiClient.get(`/questions/${id}`);
    return data as Question;
  },

  create: async (payload: Partial<Question>) => {
    const { data } = await apiClient.post('/questions', payload);
    return data as Question;
  },

  update: async (id: string, payload: Partial<Question>) => {
    const { data } = await apiClient.put(`/questions/${id}`, payload);
    return data as Question;
  },

  delete: async (id: string) => {
    await apiClient.delete(`/questions/${id}`);
  },

  bulkUploadJSON: async (file: File): Promise<BulkUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await apiClient.post('/questions/bulk-upload-json', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  bulkUploadCSV: async (file: File): Promise<BulkUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await apiClient.post('/questions/bulk-upload-csv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  getForAssignment: async (assignmentId: string) => {
    const { data } = await apiClient.get(`/questions/assignment/${assignmentId}`);
    return data as Question[];
  },
};
