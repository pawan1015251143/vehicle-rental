const express = require('express');
const router = express.Router();
const { addReview, getVehicleReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

router.post('/', protect, addReview);
router.get('/vehicle/:vehicleId', getVehicleReviews);
router.get('/:vehicleId', getVehicleReviews);

module.exports = router;
