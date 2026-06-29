const crypto = require('crypto');
const razorpay = require('../config/razorpay');
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');

// @desc    Create Razorpay order
// @route   POST /api/payments/create-order
exports.createOrder = async (req, res, next) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findByPk(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized for this booking' });
    }

    const options = {
      amount: Math.round(Number(booking.totalPrice) * 100),
      currency: 'INR',
      receipt: `receipt_booking_${booking.id}`,
    };

    const order = await razorpay.orders.create(options);

    await Payment.create({
      bookingId: booking.id,
      userId: req.user.id,
      razorpayOrderId: order.id,
      amount: booking.totalPrice,
      status: 'pending',
    });

    booking.razorpayOrderId = order.id;
    await booking.save();

    res.status(200).json({
      success: true,
      key: process.env.RAZORPAY_KEY_ID,
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Razorpay payment
// @route   POST /api/payments/verify
exports.verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const sign = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest('hex');

    if (expectedSign !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Invalid signature, payment failed' });
    }

    const payment = await Payment.findOne({ where: { razorpayOrderId: razorpay_order_id } });
    if (payment) {
      if (payment.userId !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Not authorized for this payment' });
      }

      payment.razorpayPaymentId = razorpay_payment_id;
      payment.razorpaySignature = razorpay_signature;
      payment.status = 'captured';
      await payment.save();
    }

    const booking = await Booking.findOne({ where: { razorpayOrderId: razorpay_order_id } });
    if (booking) {
      if (booking.userId !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Not authorized for this booking' });
      }

      booking.status = 'confirmed';
      booking.paymentStatus = 'paid';
      await booking.save();
    }

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      booking: booking ? { ...booking.toJSON(), _id: booking.id, totalAmount: Number(booking.totalPrice) } : null,
    });
  } catch (error) {
    next(error);
  }
};
