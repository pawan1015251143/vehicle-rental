const express = require('express');
const router = express.Router();
const { toggleWishlist, getWishlist } = require('../controllers/wishlistController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getWishlist);
router.post('/:vehicleId', protect, toggleWishlist);

module.exports = router;
