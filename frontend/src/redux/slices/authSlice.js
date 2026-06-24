import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Get user from localStorage
const storedUser = localStorage.getItem('user');
const storedToken = localStorage.getItem('token');

export const register = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/register', userData);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Registration failed');
  }
});

export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/login', credentials);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Login failed');
  }
});

export const getProfile = createAsyncThunk('auth/getProfile', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/auth/me');
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
  }
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async (profileData, { rejectWithValue }) => {
  try {
    const { data } = await api.put('/auth/profile', profileData);
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
  }
});

export const updatePassword = createAsyncThunk('auth/updatePassword', async (passwordData, { rejectWithValue }) => {
  try {
    const { data } = await api.put('/auth/password', passwordData);
    localStorage.setItem('token', data.token);
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to update password');
  }
});

export const toggleWishlist = createAsyncThunk('auth/toggleWishlist', async (vehicleId, { rejectWithValue }) => {
  try {
    const { data } = await api.post(`/wishlist/${vehicleId}`);
    return { vehicleId, wishlisted: data.wishlisted };
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to update wishlist');
  }
});

export const getWishlist = createAsyncThunk('auth/getWishlist', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/wishlist');
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to get wishlist');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: storedUser ? JSON.parse(storedUser) : null,
    token: storedToken || null,
    isAuthenticated: !!storedToken,
    loading: false,
    error: null,
    wishlist: [],
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.wishlist = [];
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(register.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Login
      .addCase(login.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Profile
      .addCase(getProfile.fulfilled, (state, action) => {
        state.user = action.payload.user;
      })
      // Update Profile
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload.user;
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      // Wishlist
      .addCase(getWishlist.fulfilled, (state, action) => {
        state.wishlist = action.payload.wishlist;
      })
      .addCase(toggleWishlist.fulfilled, (state, action) => {
        const { vehicleId, wishlisted } = action.payload;
        if (wishlisted) {
          state.user.wishlist = [...(state.user.wishlist || []), vehicleId];
        } else {
          state.user.wishlist = (state.user.wishlist || []).filter((id) => id !== vehicleId);
        }
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
