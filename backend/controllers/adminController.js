const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Booking = require('../models/Booking');

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
exports.getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalVehicles,
      totalBookings,
      pendingVehicles,
      activeBookings,
      usersByRole,
      revenueData,
      recentBookings,
    ] = await Promise.all([
      User.countDocuments(),
      Vehicle.countDocuments(),
      Booking.countDocuments(),
      Vehicle.countDocuments({ status: 'pending' }),
      Booking.countDocuments({ status: { $in: ['confirmed', 'ongoing'] } }),
      User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } },
      ]),
      Booking.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } },
      ]),
      Booking.find()
        .populate('customer', 'name email')
        .populate('vehicle', 'name brand')
        .sort('-createdAt')
        .limit(5),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalVehicles,
        totalBookings,
        pendingVehicles,
        activeBookings,
        usersByRole,
        totalRevenue: revenueData[0]?.totalRevenue || 0,
        recentBookings,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
exports.getAllUsers = async (req, res, next) => {
  try {
    const { role, page = 1, limit = 20, search } = req.query;
    const query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [users, total] = await Promise.all([
      User.find(query).sort('-createdAt').skip(skip).limit(parseInt(limit)),
      User.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role/status
// @route   PUT /api/admin/users/:id
exports.updateUser = async (req, res, next) => {
  try {
    const { role, isActive } = req.body;
    const updates = {};
    if (role) updates.role = role;
    if (typeof isActive === 'boolean') updates.isActive = isActive;

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      message: 'User updated',
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res
        .status(400)
        .json({ success: false, message: 'Cannot delete admin user' });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'User deleted',
    });
  } catch (error) {
    next(error);
  }
};
