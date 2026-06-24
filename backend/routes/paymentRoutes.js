const express = require('express');
const router = express.Router();
const {
  createOrder,
  verifyPayment,
  getPaymentDetails,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.post('/create-order', protect, createOrder);
router.post('/verify', protect, verifyPayment);
router.get('/:bookingId', protect, getPaymentDetails);

module.exports = router;
