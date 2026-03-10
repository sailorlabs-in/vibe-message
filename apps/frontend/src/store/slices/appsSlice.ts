import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import ApiRequest from '../../services/ApiRequest';
import { App, AppWithStats } from '../../types';

interface AppsState {
  apps: App[];
  selectedApp: AppWithStats | null;
  loading: boolean;
  error: string | null;
}

const initialState: AppsState = {
  apps: [],
  selectedApp: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchApps = createAsyncThunk<
  App[],
  void,
  { rejectValue: string }
>('apps/fetchApps', async (_, { rejectWithValue }) => {
  try {
    const response = await ApiRequest('/apps', 'get');
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch apps');
  }
});

export const fetchAppById = createAsyncThunk<
  AppWithStats,
  string,
  { rejectValue: string }
>('apps/fetchAppById', async (id, { rejectWithValue }) => {
  try {
    const response = await ApiRequest(`/apps/${id}`, 'get');
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch app');
  }
});

export const createNewApp = createAsyncThunk<
  App,
  { name: string; description?: string },
  { rejectValue: string }
>('apps/createApp', async (data, { rejectWithValue }) => {
  try {
    const response = await ApiRequest('/apps', 'post', data);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to create app');
  }
});

export const updateExistingApp = createAsyncThunk<
  App,
  { id: string; data: { name?: string; description?: string; is_active?: boolean } },
  { rejectValue: string }
>('apps/updateApp', async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await ApiRequest(`/apps/${id}`, 'patch', data);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to update app');
  }
});

export const rotateSecret = createAsyncThunk<
  App,
  string,
  { rejectValue: string }
>('apps/rotateSecret', async (id, { rejectWithValue }) => {
  try {
    const response = await ApiRequest(`/apps/${id}/rotate-secret`, 'post');
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to rotate secret');
  }
});

export const removeApp = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('apps/deleteApp', async (id, { rejectWithValue }) => {
  try {
    await ApiRequest(`/apps/${id}`, 'delete');
    return id;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to delete app');
  }
});

// Slice
const appsSlice = createSlice({
  name: 'apps',
  initialState,
  reducers: {
    clearSelectedApp: (state) => {
      state.selectedApp = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch apps
    builder
      .addCase(fetchApps.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchApps.fulfilled, (state, action) => {
        state.loading = false;
        state.apps = action.payload;
      })
      .addCase(fetchApps.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch apps';
      });

    // Fetch app by ID
    builder
      .addCase(fetchAppById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAppById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedApp = action.payload;
      })
      .addCase(fetchAppById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch app';
      });

    // Create app
    builder
      .addCase(createNewApp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createNewApp.fulfilled, (state, action) => {
        state.loading = false;
        state.apps.push(action.payload);
      })
      .addCase(createNewApp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to create app';
      });

    // Update app
    builder
      .addCase(updateExistingApp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateExistingApp.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.apps.findIndex(app => app.public_app_id === action.payload.public_app_id);
        if (index !== -1) {
          state.apps[index] = action.payload;
        }
        if (state.selectedApp && state.selectedApp.public_app_id === action.payload.public_app_id) {
          state.selectedApp = { ...state.selectedApp, ...action.payload };
        }
      })
      .addCase(updateExistingApp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update app';
      });

    // Rotate secret
    builder
      .addCase(rotateSecret.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(rotateSecret.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.apps.findIndex(app => app.public_app_id === action.payload.public_app_id);
        if (index !== -1) {
          state.apps[index] = action.payload;
        }
        if (state.selectedApp && state.selectedApp.public_app_id === action.payload.public_app_id) {
          state.selectedApp = { ...state.selectedApp, ...action.payload };
        }
      })
      .addCase(rotateSecret.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to rotate secret';
      });

    // Delete app
    builder
      .addCase(removeApp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeApp.fulfilled, (state, action) => {
        state.loading = false;
        state.apps = state.apps.filter(app => app.public_app_id !== action.payload);
        if (state.selectedApp && state.selectedApp.public_app_id === action.payload) {
          state.selectedApp = null;
        }
      })
      .addCase(removeApp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to delete app';
      });
  },
});

export const { clearSelectedApp, clearError } = appsSlice.actions;
export default appsSlice.reducer;
