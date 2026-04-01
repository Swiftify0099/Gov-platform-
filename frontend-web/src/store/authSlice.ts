import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, User } from '../types';
import apiClient from '../api/client';

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('access_token'),
  refreshToken: localStorage.getItem('refresh_token'),
  isAuthenticated: !!localStorage.getItem('access_token'),
  isLoading: false,
};

export const sendOTP = createAsyncThunk(
  'auth/sendOTP',
  async (phone: string, { rejectWithValue }) => {
    try {
      const res = await apiClient.post('/api/auth/send-otp', { phone });
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to send OTP');
    }
  }
);

export const verifyOTP = createAsyncThunk(
  'auth/verifyOTP',
  async (payload: { phone: string; otp: string; name?: string }, { rejectWithValue }) => {
    try {
      const res = await apiClient.post('/api/auth/verify-otp', payload);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || 'Invalid OTP');
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.get('/api/v1/users/me');
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    },
    setTokens: (state, action: PayloadAction<{ token: string; refreshToken: string }>) => {
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      localStorage.setItem('access_token', action.payload.token);
      localStorage.setItem('refresh_token', action.payload.refreshToken);
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    setCredentials: (state, action: PayloadAction<{ token: string; refreshToken: string; user: User }>) => {
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      localStorage.setItem('access_token', action.payload.token);
      localStorage.setItem('refresh_token', action.payload.refreshToken);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(verifyOTP.pending, (state) => { state.isLoading = true; })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.access_token;
        state.refreshToken = action.payload.refresh_token;
        state.isAuthenticated = true;
        localStorage.setItem('access_token', action.payload.access_token);
        localStorage.setItem('refresh_token', action.payload.refresh_token);
      })
      .addCase(verifyOTP.rejected, (state) => { state.isLoading = false; })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
      });
  },
});

export const { logout, setTokens, setUser, setCredentials } = authSlice.actions;
export default authSlice.reducer;
