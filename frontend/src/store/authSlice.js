import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import api from '../utils/api';

// Load stored authentication state
const storedToken = localStorage.getItem('closer-token') || null;
let storedUser = null;
try {
  const parsed = localStorage.getItem('closer-user');
  if (parsed) storedUser = JSON.parse(parsed);
} catch (e) {
  console.error('Error parsing stored user details:', e.message);
}

const initialState = {
  user: storedUser,
  token: storedToken,
  isAuthenticated: !!storedToken,
  isLoading: false,
  error: null
};

// API Endpoint Headers Injector helper
const getAuthConfig = (token) => ({
  headers: { Authorization: `Bearer ${token}` }
});

// THUNKS
export const registerUser = createAsyncThunk(
  'auth/register',
  async (credentials, { rejectWithValue }) => {
    try {
      const res = await axios.post('/api/auth/register', credentials);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Registration failed.');
    }
  }
);

export const verifyOtp = createAsyncThunk(
  'auth/verifyOtp',
  async (otpData, { rejectWithValue }) => {
    try {
      const res = await axios.post('/api/auth/verify-otp', otpData);
      return res.data; // payload contains user and token
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'OTP verification failed.');
    }
  }
);

export const resendOtp = createAsyncThunk(
  'auth/resendOtp',
  async (userId, { rejectWithValue }) => {
    try {
      const res = await axios.post('/api/auth/resend-otp', { userId });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to resend OTP.');
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const res = await axios.post('/api/auth/login', credentials);
      return res.data; // payload contains user, token, themePreference
    } catch (err) {
      if (err.response?.data?.unverified) {
        return rejectWithValue(err.response.data);
      }
      return rejectWithValue(err.response?.data?.message || 'Login failed.');
    }
  }
);

export const googleLoginAsync = createAsyncThunk(
  'auth/googleLogin',
  async (token, { rejectWithValue }) => {
    try {
      const res = await api.post('/api/auth/google', { token });
      return res.data; // { success, token, user }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Google Login failed.');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { dispatch }) => {
    dispatch(logout());
    return true;
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('closer-token');
      localStorage.removeItem('closer-user');
    },
    clearAuthError(state) {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Verify OTP
      .addCase(verifyOtp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
        localStorage.setItem('closer-token', action.payload.token);
        localStorage.setItem('closer-user', JSON.stringify(action.payload.user));
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Resend OTP
      .addCase(resendOtp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resendOtp.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(resendOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
        localStorage.setItem('closer-token', action.payload.token);
        localStorage.setItem('closer-user', JSON.stringify(action.payload.user));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Google Login
      .addCase(googleLoginAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(googleLoginAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        localStorage.setItem('closer-token', action.payload.token);
        localStorage.setItem('closer-user', JSON.stringify(action.payload.user));
      })
      .addCase(googleLoginAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
export { getAuthConfig };