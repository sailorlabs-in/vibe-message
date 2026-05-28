import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import ApiRequest from '../../services/ApiRequest';
import { User, AuthResponse } from '../../types';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  loading: false,
  error: null,
};

// Async thunks
export const loginUser = createAsyncThunk<
  AuthResponse,
  { email: string; password: string },
  { rejectValue: string }
>('auth/login', async ({ email, password }, { rejectWithValue }) => {
  try {
    const response = await ApiRequest('/auth/login', 'post', { email, password }, false);
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    return { token, user };
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Login failed');
  }
});

export const signupUser = createAsyncThunk<
  AuthResponse,
  { name: string; email: string; password: string },
  { rejectValue: string }
>('auth/signup', async ({ name, email, password }, { rejectWithValue }) => {
  try {
    const response = await ApiRequest('/auth/signup', 'post', { name, email, password }, false);
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    return { token, user };
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Signup failed');
  }
});

export const getCurrentUser = createAsyncThunk<
  User,
  void,
  { rejectValue: string }
>('auth/getCurrentUser', async (_, { rejectWithValue }) => {
  try {
    const response = await ApiRequest('/auth/me', 'get');
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch user');
  }
});

export const updateUserProfile = createAsyncThunk<
  User,
  { name?: string; email?: string },
  { rejectValue: string }
>('auth/updateProfile', async (data, { rejectWithValue }) => {
  try {
    const response = await ApiRequest('/auth/profile', 'patch', data);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
  }
});

export const changeUserPassword = createAsyncThunk<
  void,
  { oldPassword: string; newPassword: string },
  { rejectValue: string }
>('auth/changePassword', async ({ oldPassword, newPassword }, { rejectWithValue }) => {
  try {
    await ApiRequest('/auth/change-password', 'patch', { oldPassword, newPassword });
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to change password');
  }
});

export const deleteUserAccount = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>('auth/deleteAccount', async (_, { rejectWithValue }) => {
  try {
    await ApiRequest('/auth/account', 'delete');
    localStorage.removeItem('token');
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to delete account');
  }
});

export const forgotPassword = createAsyncThunk<
  void,
  { email: string },
  { rejectValue: string }
>('auth/forgotPassword', async ({ email }, { rejectWithValue }) => {
  try {
    await ApiRequest('/auth/forgot-password', 'post', { email }, false);
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to send reset email');
  }
});

export const resetPassword = createAsyncThunk<
  void,
  { token: string; newPassword: string },
  { rejectValue: string }
>('auth/resetPassword', async ({ token, newPassword }, { rejectWithValue }) => {
  try {
    await ApiRequest('/auth/reset-password', 'post', { token, newPassword }, false);
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to reset password');
  }
});

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logoutUser: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem('token');
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Login failed';
      });

    // Signup
    builder
      .addCase(signupUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Signup failed';
      });

    // Get current user
    builder
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch user';
      });

    // Update profile
    builder
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update profile';
      });

    // Change password
    builder
      .addCase(changeUserPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changeUserPassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(changeUserPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to change password';
      });

    // Delete account
    builder
      .addCase(deleteUserAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUserAccount.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
      })
      .addCase(deleteUserAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to delete account';
      });

    // Forgot password
    builder
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to send reset email';
      });

    // Reset password
    builder
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to reset password';
      });
  },
});

export const { logoutUser, clearError } = authSlice.actions;
export default authSlice.reducer;
