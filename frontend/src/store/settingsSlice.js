import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { getAuthConfig } from './authSlice';

const initialState = {
  preferences: null,
  stats: null,
  minimalMode: false,
  selectedModel: 'gemini-1.5-flash',
  isLoading: false,
  error: null
};

// THUNKS
export const fetchPreferences = createAsyncThunk(
  'settings/fetchPreferences',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const res = await axios.get('/api/profile/preferences', getAuthConfig(token));
      return res.data.preference;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load companion settings.');
    }
  }
);

export const updatePreferences = createAsyncThunk(
  'settings/updatePreferences',
  async (prefData, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const res = await axios.put('/api/profile/preferences', prefData, getAuthConfig(token));
      return res.data.preference;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to save companion settings.');
    }
  }
);

export const fetchRelationshipStats = createAsyncThunk(
  'settings/fetchStats',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const res = await axios.get('/api/relationship/stats', getAuthConfig(token));
      return res.data.stats;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load relationship stats.');
    }
  }
);

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    toggleMinimalMode: (state) => {
      state.minimalMode = !state.minimalMode;
    },
    setModel: (state, action) => {
      state.selectedModel = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPreferences.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPreferences.fulfilled, (state, action) => {
        state.isLoading = false;
        state.preferences = action.payload;
      })
      .addCase(fetchPreferences.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(updatePreferences.fulfilled, (state, action) => {
        state.preferences = action.payload;
      })
      .addCase(fetchRelationshipStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });
  }
});

export const { toggleMinimalMode, setModel } = settingsSlice.actions;
export default settingsSlice.reducer;