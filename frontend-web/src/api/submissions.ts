import apiClient from './client';
import { Submission } from '../types';

export interface AnswerPayload {
  question_id: string;
  selected_options: number[];
  time_spent_seconds?: number;
}

export const submissionsApi = {
  start: async (assignment_id: string, face_verified: boolean) => {
    const { data } = await apiClient.post('/submissions/start', {
      assignment_id,
      face_verified,
    });
    return data;
  },

  submitAnswer: async (submission_id: string, answer: AnswerPayload) => {
    const { data } = await apiClient.put(`/submissions/${submission_id}/answer`, answer);
    return data;
  },

  submit: async (submission_id: string) => {
    const { data } = await apiClient.post(`/submissions/${submission_id}/submit`);
    return data as Submission;
  },

  get: async (submission_id: string) => {
    const { data } = await apiClient.get(`/submissions/${submission_id}`);
    return data as Submission;
  },

  listMine: async (params?: { page?: number; limit?: number }) => {
    const { data } = await apiClient.get('/submissions/mine', { params });
    return data;
  },
};
