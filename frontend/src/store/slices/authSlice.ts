import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiClient } from '@/lib/api';
import { AuthResponse, User } from '@/types';

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('taskly_token') : null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ usernameOrEmail, password }: { usernameOrEmail: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.login({ usernameOrEmail, password });
      return response;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      return rejectWithValue(errorMessage);
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async ({ username, email, password }: { username: string; email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.register({ username, email, password });
      return response;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      return rejectWithValue(errorMessage);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      // Clear token from localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('taskly_token');
      }
      return null;
    } catch {
      return rejectWithValue('Logout failed');
    }
  }
);

export const checkAuthStatus = createAsyncThunk(
  'auth/checkStatus',
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { auth: AuthState };
      const token = state.auth.token;
      
      if (!token) {
        throw new Error('No token found');
      }

      // You can add an API call here to validate the token
      // For now, we'll just check if token exists
      return { isValid: true };
    } catch {
      return rejectWithValue('Authentication check failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      state.isAuthenticated = true;
      if (typeof window !== 'undefined') {
        localStorage.setItem('taskly_token', action.payload);
      }
    },
    clearAuth: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('taskly_token');
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.accessToken;
        state.isAuthenticated = true;
        state.error = null;
        if (typeof window !== 'undefined') {
          localStorage.setItem('taskly_token', action.payload.accessToken);
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.accessToken;
        state.isAuthenticated = true;
        state.error = null;
        if (typeof window !== 'undefined') {
          localStorage.setItem('taskly_token', action.payload.accessToken);
        }
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      // Check auth status
      .addCase(checkAuthStatus.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAuthStatus.fulfilled, (state) => {
        state.isLoading = false;
        state.isAuthenticated = !!state.token;
      })
      .addCase(checkAuthStatus.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
      });
  },
});

export const { clearError, setToken, clearAuth } = authSlice.actions;
export default authSlice.reducer;
