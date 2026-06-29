const Review = require('../models/Review');
const Booking = require('../models/Booking');

// @desc    Add a review
// @route   POST /api/reviews
exports.addReview = async (req, res, next) => {
  try {
    const { bookingId, rating, comment } = req.body;
    let { vehicleId } = req.body;

    if (bookingId && !vehicleId) {
      const booking = await Booking.findByPk(bookingId);
      if (!booking) {
        return res.status(404).json({ success: false, message: 'Booking not found' });
      }

      if (booking.userId !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Not authorized for this booking' });
      }

      vehicleId = booking.vehicleId;
    }

    if (!vehicleId || !rating) {
      return res.status(400).json({ success: false, message: 'Vehicle and rating are required' });
    }

    const review = await Review.create({
      userId: req.user.id,
      vehicleId,
      rating,
      comment,
    });

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      review: { ...review.toJSON(), _id: review.id },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get vehicle reviews
// @route   GET /api/reviews/vehicle/:vehicleId
exports.getVehicleReviews = async (req, res, next) => {
  try {
    const reviews = await Review.findAll({
      where: { vehicleId: req.params.vehicleId },
      order: [['createdAt', 'DESC']],
    });

    const formattedReviews = reviews.map((review) => ({
      ...review.toJSON(),
      _id: review.id,
    }));

    res.status(200).json({
      success: true,
      reviews: formattedReviews,
    });
  } catch (error) {
    next(error);
  }
};
