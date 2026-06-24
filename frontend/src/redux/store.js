import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import vehicleReducer from './slices/vehicleSlice';
import bookingReducer from './slices/bookingSlice';
import chatReducer from './slices/chatSlice';
import adminReducer from './slices/adminSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    vehicles: vehicleReducer,
    bookings: bookingReducer,
    chat: chatReducer,
    admin: adminReducer,
  },
  devTools: import.meta.env.DEV,
});
