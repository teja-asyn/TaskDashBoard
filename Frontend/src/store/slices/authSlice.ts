import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { AuthState, User, LoginCredentials, RegisterCredentials } from '../../types';
import { apiSlice } from '../api/apiSlice';

// Load user from localStorage if available
const loadUserFromStorage = (): any => {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
};

const initialState: AuthState = {
  user: loadUserFromStorage(),
  token: localStorage.getItem('token'),
  isLoading: false,
  error: null,
};

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        return rejectWithValue(data.message);
      }
      
      localStorage.setItem('token', data.token);
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      return rejectWithValue(message);
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (credentials: RegisterCredentials, { rejectWithValue }) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        return rejectWithValue(data.message);
      }
      
      localStorage.setItem('token', data.token);
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      return rejectWithValue(message);
    }
  }
);

// Logout thunk that clears cache and auth state
export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { dispatch }) => {
    // Clear RTK Query cache first to prevent data leakage
    dispatch(apiSlice.util.resetApiState());
    // Then clear auth state
    dispatch(logout());
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      state.user = null;
      state.token = null;
      state.error = null;
      // Reset RTK Query cache to prevent data leakage between users
      // This will be dispatched separately in the logout action handler
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        // Extract user data (excluding token)
        const { token, ...userData } = action.payload;
        state.user = userData;
        state.token = token;
        // Persist user data to localStorage
        localStorage.setItem('user', JSON.stringify(userData));
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        // Extract user data (excluding token)
        const { token, ...userData } = action.payload;
        state.user = userData;
        state.token = token;
        // Persist user data to localStorage
        localStorage.setItem('user', JSON.stringify(userData));
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, setUser, clearError } = authSlice.actions;
export default authSlice.reducer;