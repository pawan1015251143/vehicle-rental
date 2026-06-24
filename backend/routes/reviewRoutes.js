const express = require('express');
const router = express.Router();
const {
  createReview,
  getVehicleReviews,
  deleteReview,
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createReview);
router.get('/vehicle/:vehicleId', getVehicleReviews);
router.delete('/:id', protect, deleteReview);

module.exports = router;
