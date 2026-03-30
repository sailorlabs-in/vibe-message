import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import ApiRequest from '../../services/ApiRequest';
import { User, UserStatus, UserRole } from '../../types';

interface AdminState {
  users: User[];
  loading: boolean;
  error: string | null;
}

const initialState: AdminState = {
  users: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchAllUsers = createAsyncThunk<
  User[],
  UserStatus | undefined,
  { rejectValue: string }
>('admin/fetchAllUsers', async (status, { rejectWithValue }) => {
  try {
    const url = status ? `/admin/users?status=${status}` : '/admin/users';
    const response = await ApiRequest(url, 'get');
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
  }
});

export const updateStatus = createAsyncThunk<
  User,
  { userId: number; status: UserStatus },
  { rejectValue: string }
>('admin/updateStatus', async ({ userId, status }, { rejectWithValue }) => {
  try {
    const response = await ApiRequest(`/admin/users/${userId}/status`, 'patch', { status });
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to update status');
  }
});

export const updateRole = createAsyncThunk<
  User,
  { userId: number; role: UserRole },
  { rejectValue: string }
>('admin/updateRole', async ({ userId, role }, { rejectWithValue }) => {
  try {
    const response = await ApiRequest(`/admin/users/${userId}/role`, 'patch', { role });
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to update role');
  }
});

export const updateAppLimit = createAsyncThunk<
  User,
  { userId: number; appLimit: number | null },
  { rejectValue: string }
>('admin/updateAppLimit', async ({ userId, appLimit }, { rejectWithValue }) => {
  try {
    const response = await ApiRequest(`/admin/users/${userId}/app-limit`, 'patch', { appLimit });
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to update app limit');
  }
});

export const updateUserRetentionPermission = createAsyncThunk<
  User,
  { userId: number; canManageRetention: boolean },
  { rejectValue: string }
>('admin/updateUserRetentionPermission', async ({ userId, canManageRetention }, { rejectWithValue }) => {
  try {
    const response = await ApiRequest(`/admin/users/${userId}/retention-permission`, 'patch', { canManageRetention });
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to update retention permission');
  }
});

export const sendWarning = createAsyncThunk<
  void,
  { userId: number; message: string },
  { rejectValue: string }
>('admin/sendWarning', async ({ userId, message }, { rejectWithValue }) => {
  try {
    await ApiRequest(`/admin/users/${userId}/warn`, 'post', { message });
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to send warning');
  }
});

export const removeUser = createAsyncThunk<
  { userId: number; deletedAppsCount: number },
  number,
  { rejectValue: string }
>('admin/removeUser', async (userId, { rejectWithValue }) => {
  try {
    const response = await ApiRequest(`/admin/users/${userId}`, 'delete');
    return { userId, deletedAppsCount: response.data?.deletedAppsCount || 0 };
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to delete user');
  }
});

// Slice
const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch all users
    builder
      .addCase(fetchAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch users';
      });

    // Update status
    builder
      .addCase(updateStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.users.findIndex(user => user.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      .addCase(updateStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update status';
      });

    // Update app limit
    builder
      .addCase(updateAppLimit.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAppLimit.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.users.findIndex(user => user.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      .addCase(updateAppLimit.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update app limit';
      });

    // Update retention permission
    builder
      .addCase(updateUserRetentionPermission.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserRetentionPermission.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.users.findIndex(user => user.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      .addCase(updateUserRetentionPermission.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update retention permission';
      });

    // Update role
    builder
      .addCase(updateRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateRole.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.users.findIndex(user => user.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      .addCase(updateRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update role';
      });

    // Send warning
    builder
      .addCase(sendWarning.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendWarning.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(sendWarning.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to send warning';
      });

    // Remove user
    builder
      .addCase(removeUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter(user => user.id !== action.payload.userId);
      })
      .addCase(removeUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to delete user';
      });
  },
});

export const { clearError } = adminSlice.actions;
export default adminSlice.reducer;
