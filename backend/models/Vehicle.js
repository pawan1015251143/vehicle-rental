const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Vehicle name is required'],
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Vehicle type is required'],
      enum: ['car', 'bike', 'scooter', 'suv', 'van', 'truck'],
    },
    brand: {
      type: String,
      required: [true, 'Brand is required'],
      trim: true,
    },
    model: {
      type: String,
      required: [true, 'Model is required'],
      trim: true,
    },
    year: {
      type: Number,
      required: [true, 'Year is required'],
    },
    registrationNumber: {
      type: String,
      required: [true, 'Registration number is required'],
      unique: true,
      uppercase: true,
    },
    fuelType: {
      type: String,
      enum: ['petrol', 'diesel', 'electric', 'hybrid', 'cng'],
      required: true,
    },
    transmission: {
      type: String,
      enum: ['manual', 'automatic'],
      required: true,
    },
    seats: {
      type: Number,
      required: [true, 'Number of seats is required'],
    },
    pricePerHour: {
      type: Number,
      required: [true, 'Hourly price is required'],
      min: [0, 'Price cannot be negative'],
    },
    pricePerDay: {
      type: Number,
      required: [true, 'Daily price is required'],
      min: [0, 'Price cannot be negative'],
    },
    location: {
      city: { type: String, required: true },
      state: { type: String },
      address: { type: String },
    },
    images: [
      {
        public_id: String,
        url: String,
      },
    ],
    features: [String],
    description: {
      type: String,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'unavailable'],
      default: 'pending',
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    totalBookings: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Index for search
vehicleSchema.index({ name: 'text', brand: 'text', model: 'text' });
vehicleSchema.index({ 'location.city': 1, type: 1, status: 1 });

module.exports = mongoose.model('Vehicle', vehicleSchema);
