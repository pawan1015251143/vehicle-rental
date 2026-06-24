const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      maxlength: [500, 'Comment cannot exceed 500 characters'],
    },
  },
  { timestamps: true }
);

// Prevent duplicate reviews per booking
reviewSchema.index({ user: 1, booking: 1 }, { unique: true });

// Static method to calculate average rating
reviewSchema.statics.calculateAverageRating = async function (vehicleId) {
  const stats = await this.aggregate([
    { $match: { vehicle: vehicleId } },
    {
      $group: {
        _id: '$vehicle',
        avgRating: { $avg: '$rating' },
        numReviews: { $sum: 1 },
      },
    },
  ]);

  const Vehicle = require('./Vehicle');

  if (stats.length > 0) {
    await Vehicle.findByIdAndUpdate(vehicleId, {
      averageRating: Math.round(stats[0].avgRating * 10) / 10,
      totalReviews: stats[0].numReviews,
    });
  } else {
    await Vehicle.findByIdAndUpdate(vehicleId, {
      averageRating: 0,
      totalReviews: 0,
    });
  }
};

reviewSchema.post('save', function () {
  this.constructor.calculateAverageRating(this.vehicle);
});

reviewSchema.post('findOneAndDelete', function (doc) {
  if (doc) {
    doc.constructor.calculateAverageRating(doc.vehicle);
  }
});

module.exports = mongoose.model('Review', reviewSchema);
