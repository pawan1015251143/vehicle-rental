import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchDashboardStats = createAsyncThunk('admin/stats', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/admin/stats');
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch stats');
  }
});

export const fetchAllUsers = createAsyncThunk('admin/users', async (params = {}, { rejectWithValue }) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const { data } = await api.get(`/admin/users?${queryString}`);
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
  }
});

export const adminUpdateUser = createAsyncThunk('admin/updateUser', async ({ id, updates }, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/admin/users/${id}`, updates);
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to update user');
  }
});

export const adminDeleteUser = createAsyncThunk('admin/deleteUser', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/admin/users/${id}`);
    return id;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to delete user');
  }
});

export const fetchAllVehiclesAdmin = createAsyncThunk('admin/vehicles', async (params = {}, { rejectWithValue }) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const { data } = await api.get(`/vehicles/admin/all?${queryString}`);
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch vehicles');
  }
});

export const approveVehicle = createAsyncThunk('admin/approveVehicle', async ({ id, status }, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/vehicles/${id}/approval`, { status });
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to update vehicle');
  }
});

export const fetchAllBookingsAdmin = createAsyncThunk('admin/bookings', async (params = {}, { rejectWithValue }) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const { data } = await api.get(`/bookings/admin/all?${queryString}`);
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch bookings');
  }
});

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    stats: null,
    users: [],
    vehicles: [],
    bookings: [],
    loading: false,
    error: null,
    total: 0,
    totalPages: 0,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => { state.loading = true; })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload.stats;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.users = action.payload.users;
        state.total = action.payload.total;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(adminUpdateUser.fulfilled, (state, action) => {
        state.users = state.users.map((u) => u._id === action.payload.user._id ? action.payload.user : u);
      })
      .addCase(adminDeleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter((u) => u._id !== action.payload);
      })
      .addCase(fetchAllVehiclesAdmin.fulfilled, (state, action) => {
        state.vehicles = action.payload.vehicles;
        state.total = action.payload.total;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(approveVehicle.fulfilled, (state, action) => {
        state.vehicles = state.vehicles.map((v) => v._id === action.payload.vehicle._id ? action.payload.vehicle : v);
      })
      .addCase(fetchAllBookingsAdmin.fulfilled, (state, action) => {
        state.bookings = action.payload.bookings;
        state.total = action.payload.total;
        state.totalPages = action.payload.totalPages;
      });
  },
});

export default adminSlice.reducer;
