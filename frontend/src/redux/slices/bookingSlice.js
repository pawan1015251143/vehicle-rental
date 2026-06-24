import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const createBooking = createAsyncThunk('bookings/create', async (bookingData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/bookings', bookingData);
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to create booking');
  }
});

export const fetchMyBookings = createAsyncThunk('bookings/fetchMine', async (params = {}, { rejectWithValue }) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const { data } = await api.get(`/bookings/my?${queryString}`);
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch bookings');
  }
});

export const fetchOwnerBookings = createAsyncThunk('bookings/fetchOwner', async (params = {}, { rejectWithValue }) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const { data } = await api.get(`/bookings/owner?${queryString}`);
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch bookings');
  }
});

export const fetchBooking = createAsyncThunk('bookings/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/bookings/${id}`);
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch booking');
  }
});

export const updateBookingStatus = createAsyncThunk('bookings/updateStatus', async ({ id, status, cancellationReason }, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/bookings/${id}/status`, { status, cancellationReason });
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to update booking');
  }
});

export const createPaymentOrder = createAsyncThunk('bookings/createPayment', async (bookingId, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/payments/create-order', { bookingId });
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to create payment');
  }
});

export const verifyPayment = createAsyncThunk('bookings/verifyPayment', async (paymentData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/payments/verify', paymentData);
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Payment verification failed');
  }
});

export const submitReview = createAsyncThunk('bookings/submitReview', async (reviewData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/reviews', reviewData);
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to submit review');
  }
});

const bookingSlice = createSlice({
  name: 'bookings',
  initialState: {
    bookings: [],
    booking: null,
    loading: false,
    error: null,
    total: 0,
    totalPages: 0,
    paymentOrder: null,
  },
  reducers: {
    clearBookingError: (state) => { state.error = null; },
    clearBooking: (state) => { state.booking = null; },
    clearPaymentOrder: (state) => { state.paymentOrder = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createBooking.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.booking = action.payload.booking;
        state.bookings.unshift(action.payload.booking);
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchMyBookings.pending, (state) => { state.loading = true; })
      .addCase(fetchMyBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload.bookings;
        state.total = action.payload.total;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchMyBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchOwnerBookings.pending, (state) => { state.loading = true; })
      .addCase(fetchOwnerBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload.bookings;
        state.total = action.payload.total;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchOwnerBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchBooking.fulfilled, (state, action) => {
        state.booking = action.payload.booking;
      })
      .addCase(updateBookingStatus.fulfilled, (state, action) => {
        const updated = action.payload.booking;
        state.bookings = state.bookings.map((b) => (b._id === updated._id ? updated : b));
        if (state.booking?._id === updated._id) state.booking = updated;
      })
      .addCase(createPaymentOrder.fulfilled, (state, action) => {
        state.paymentOrder = action.payload;
      })
      .addCase(verifyPayment.fulfilled, (state, action) => {
        const updated = action.payload.booking;
        state.bookings = state.bookings.map((b) => (b._id === updated._id ? updated : b));
        if (state.booking?._id === updated._id) state.booking = updated;
        state.paymentOrder = null;
      });
  },
});

export const { clearBookingError, clearBooking, clearPaymentOrder } = bookingSlice.actions;
export default bookingSlice.reducer;
