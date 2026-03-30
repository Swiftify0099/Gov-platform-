import apiClient from './client';

export interface LoginRequest {
  phone_number: string;
}

export interface OTPVerifyRequest {
  phone_number: string;
  otp: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: {
    id: string;
    role: string;
    is_profile_complete: boolean;
  };
}

export const authApi = {
  sendOTP: async (phone_number: string): Promise<{ message: string }> => {
    const { data } = await apiClient.post('/auth/send-otp', { phone_number });
    return data;
  },

  verifyOTP: async (payload: OTPVerifyRequest): Promise<TokenResponse> => {
    const { data } = await apiClient.post('/auth/verify-otp', payload);
    return data;
  },

  refreshToken: async (refresh_token: string): Promise<TokenResponse> => {
    const { data } = await apiClient.post('/auth/refresh', { refresh_token });
    return data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },
};
