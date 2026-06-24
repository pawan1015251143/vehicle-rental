import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchVehicles = createAsyncThunk('vehicles/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const { data } = await api.get(`/vehicles?${queryString}`);
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch vehicles');
  }
});

export const fetchVehicle = createAsyncThunk('vehicles/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/vehicles/${id}`);
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch vehicle');
  }
});

export const createVehicle = createAsyncThunk('vehicles/create', async (formData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/vehicles', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to create vehicle');
  }
});

export const updateVehicle = createAsyncThunk('vehicles/update', async ({ id, formData }, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/vehicles/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to update vehicle');
  }
});

export const deleteVehicle = createAsyncThunk('vehicles/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/vehicles/${id}`);
    return id;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to delete vehicle');
  }
});

export const fetchMyVehicles = createAsyncThunk('vehicles/fetchMine', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/vehicles/owner/me');
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch your vehicles');
  }
});

export const fetchVehicleReviews = createAsyncThunk('vehicles/fetchReviews', async ({ vehicleId, page = 1 }, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/reviews/vehicle/${vehicleId}?page=${page}`);
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch reviews');
  }
});

const vehicleSlice = createSlice({
  name: 'vehicles',
  initialState: {
    vehicles: [],
    vehicle: null,
    myVehicles: [],
    reviews: [],
    loading: false,
    error: null,
    total: 0,
    totalPages: 0,
    currentPage: 1,
  },
  reducers: {
    clearVehicleError: (state) => { state.error = null; },
    clearVehicle: (state) => { state.vehicle = null; state.reviews = []; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVehicles.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchVehicles.fulfilled, (state, action) => {
        state.loading = false;
        state.vehicles = action.payload.vehicles;
        state.total = action.payload.total;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
      })
      .addCase(fetchVehicles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchVehicle.pending, (state) => { state.loading = true; })
      .addCase(fetchVehicle.fulfilled, (state, action) => {
        state.loading = false;
        state.vehicle = action.payload.vehicle;
      })
      .addCase(fetchVehicle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createVehicle.fulfilled, (state, action) => {
        state.myVehicles.unshift(action.payload.vehicle);
      })
      .addCase(deleteVehicle.fulfilled, (state, action) => {
        state.myVehicles = state.myVehicles.filter((v) => v._id !== action.payload);
        state.vehicles = state.vehicles.filter((v) => v._id !== action.payload);
      })
      .addCase(fetchMyVehicles.pending, (state) => { state.loading = true; })
      .addCase(fetchMyVehicles.fulfilled, (state, action) => {
        state.loading = false;
        state.myVehicles = action.payload.vehicles;
      })
      .addCase(fetchMyVehicles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchVehicleReviews.fulfilled, (state, action) => {
        state.reviews = action.payload.reviews;
      });
  },
});

export const { clearVehicleError, clearVehicle } = vehicleSlice.actions;
export default vehicleSlice.reducer;
