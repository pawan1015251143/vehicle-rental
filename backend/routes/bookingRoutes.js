const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getOwnerBookings,
  updateBookingStatus,
  assignDriver,
  getAllBookingsAdmin,
  getBooking,
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('customer'), createBooking);
router.get('/my', protect, getMyBookings);
router.get('/owner', protect, authorize('owner'), getOwnerBookings);
router.get('/admin/all', protect, authorize('admin'), getAllBookingsAdmin);
router.get('/:id', protect, getBooking);
router.put('/:id/status', protect, updateBookingStatus);
router.put('/:id/driver', protect, authorize('owner', 'admin'), assignDriver);

module.exports = router;
