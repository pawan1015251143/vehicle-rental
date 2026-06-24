const User = require('../models/User');

// @desc    Toggle wishlist item
// @route   POST /api/wishlist/:vehicleId
exports.toggleWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const vehicleId = req.params.vehicleId;

    const index = user.wishlist.indexOf(vehicleId);

    if (index > -1) {
      user.wishlist.splice(index, 1);
      await user.save();
      return res.status(200).json({
        success: true,
        message: 'Removed from wishlist',
        wishlisted: false,
      });
    }

    user.wishlist.push(vehicleId);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Added to wishlist',
      wishlisted: true,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get wishlist
// @route   GET /api/wishlist
exports.getWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'wishlist',
      populate: { path: 'owner', select: 'name' },
    });

    res.status(200).json({
      success: true,
      count: user.wishlist.length,
      wishlist: user.wishlist,
    });
  } catch (error) {
    next(error);
  }
};
