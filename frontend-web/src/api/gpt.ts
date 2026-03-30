import apiClient from './client';

export interface GPTExplainRequest {
  question_id: string;
  question_text: string;
  options: string[];
  correct_answer: string;
  language: string;
}

export interface GPTExplainResponse {
  explanation: string;
  cached: boolean;
}

export const gptApi = {
  explain: async (payload: GPTExplainRequest): Promise<GPTExplainResponse> => {
    const { data } = await apiClient.post('/gpt/explain', payload);
    return data;
  },
};
