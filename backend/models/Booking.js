const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    bookingType: {
      type: String,
      enum: ['hourly', 'daily'],
      required: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    totalHours: {
      type: Number,
    },
    totalDays: {
      type: Number,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    pickupLocation: {
      type: String,
      required: [true, 'Pickup location is required'],
    },
    dropoffLocation: {
      type: String,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'ongoing', 'completed', 'cancelled'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded', 'failed'],
      default: 'pending',
    },
    paymentId: String,
    orderId: String,
    razorpaySignature: String,
    cancellationReason: String,
    notes: String,
  },
  { timestamps: true }
);

bookingSchema.index({ customer: 1, status: 1 });
bookingSchema.index({ owner: 1, status: 1 });
bookingSchema.index({ vehicle: 1, startDate: 1, endDate: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
