const crypto = require('crypto');
const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');
const razorpay = require('../config/razorpay');

// @desc    Create Razorpay order
// @route   POST /api/payments/create-order
exports.createOrder = async (req, res, next) => {
  try {
    const { bookingId } = req.body;

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

    if (booking.paymentStatus === 'paid') {
      return res
        .status(400)
        .json({ success: false, message: 'Payment already completed' });
    }

    const options = {
      amount: Math.round(booking.totalAmount * 100), // Razorpay expects paise
      currency: 'INR',
      receipt: `booking_${booking._id}`,
      notes: {
        bookingId: booking._id.toString(),
        customerEmail: req.user.email,
      },
    };

    const order = await razorpay.orders.create(options);

    booking.orderId = order.id;
    await booking.save();

    res.status(200).json({
      success: true,
      order,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify payment
// @route   POST /api/payments/verify
exports.verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res
        .status(400)
        .json({ success: false, message: 'Payment verification failed' });
    }

    // Update booking
    const booking = await Booking.findOne({ orderId: razorpay_order_id });
    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: 'Booking not found' });
    }

    booking.paymentId = razorpay_payment_id;
    booking.razorpaySignature = razorpay_signature;
    booking.paymentStatus = 'paid';
    booking.status = 'confirmed';
    await booking.save();

    // Increment vehicle booking count
    await Vehicle.findByIdAndUpdate(booking.vehicle, {
      $inc: { totalBookings: 1 },
    });

    await booking.populate([
      { path: 'vehicle', select: 'name brand model images' },
      { path: 'customer', select: 'name email' },
    ]);

    res.status(200).json({
      success: true,
      message: 'Payment verified and booking confirmed',
      booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get payment details
// @route   GET /api/payments/:bookingId
exports.getPaymentDetails = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.bookingId)
      .populate('vehicle', 'name brand model pricePerDay pricePerHour')
      .populate('customer', 'name email');

    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: 'Booking not found' });
    }

    res.status(200).json({
      success: true,
      payment: {
        bookingId: booking._id,
        amount: booking.totalAmount,
        status: booking.paymentStatus,
        paymentId: booking.paymentId,
        orderId: booking.orderId,
        vehicle: booking.vehicle,
        customer: booking.customer,
      },
    });
  } catch (error) {
    next(error);
  }
};
