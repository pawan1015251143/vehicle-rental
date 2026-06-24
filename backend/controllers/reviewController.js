const Review = require('../models/Review');
const Booking = require('../models/Booking');

// @desc    Create review
// @route   POST /api/reviews
exports.createReview = async (req, res, next) => {
  try {
    const { bookingId, rating, comment } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: 'Booking not found' });
    }

    if (booking.customer.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: 'Not authorized' });
    }

    if (booking.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only review completed bookings',
      });
    }

    // Check for existing review
    const existingReview = await Review.findOne({
      user: req.user._id,
      booking: bookingId,
    });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You already reviewed this booking',
      });
    }

    const review = await Review.create({
      user: req.user._id,
      vehicle: booking.vehicle,
      booking: bookingId,
      rating,
      comment,
    });

    await review.populate('user', 'name avatar');

    res.status(201).json({
      success: true,
      message: 'Review submitted',
      review,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get vehicle reviews
// @route   GET /api/reviews/vehicle/:vehicleId
exports.getVehicleReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [reviews, total] = await Promise.all([
      Review.find({ vehicle: req.params.vehicleId })
        .populate('user', 'name avatar')
        .sort('-createdAt')
        .skip(skip)
        .limit(parseInt(limit)),
      Review.countDocuments({ vehicle: req.params.vehicleId }),
    ]);

    res.status(200).json({
      success: true,
      count: reviews.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res
        .status(404)
        .json({ success: false, message: 'Review not found' });
    }

    if (
      review.user.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res
        .status(403)
        .json({ success: false, message: 'Not authorized' });
    }

    await Review.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Review deleted',
    });
  } catch (error) {
    next(error);
  }
};
