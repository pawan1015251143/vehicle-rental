const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');

// @desc    Create booking
// @route   POST /api/bookings
exports.createBooking = async (req, res, next) => {
  try {
    const {
      vehicle: vehicleId,
      bookingType,
      startDate,
      endDate,
      pickupLocation,
      dropoffLocation,
      notes,
    } = req.body;

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res
        .status(404)
        .json({ success: false, message: 'Vehicle not found' });
    }

    if (vehicle.status !== 'approved' || !vehicle.isAvailable) {
      return res
        .status(400)
        .json({ success: false, message: 'Vehicle is not available' });
    }

    // Check for conflicting bookings
    const conflicting = await Booking.findOne({
      vehicle: vehicleId,
      status: { $in: ['pending', 'confirmed', 'ongoing'] },
      $or: [
        {
          startDate: { $lte: new Date(endDate) },
          endDate: { $gte: new Date(startDate) },
        },
      ],
    });

    if (conflicting) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle is already booked for these dates',
      });
    }

    // Calculate total amount
    const start = new Date(startDate);
    const end = new Date(endDate);
    let totalAmount, totalHours, totalDays;

    if (bookingType === 'hourly') {
      totalHours = Math.ceil((end - start) / (1000 * 60 * 60));
      totalAmount = totalHours * vehicle.pricePerHour;
    } else {
      totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      totalDays = totalDays < 1 ? 1 : totalDays;
      totalAmount = totalDays * vehicle.pricePerDay;
    }

    const booking = await Booking.create({
      customer: req.user._id,
      vehicle: vehicleId,
      owner: vehicle.owner,
      bookingType,
      startDate: start,
      endDate: end,
      totalHours,
      totalDays,
      totalAmount,
      pickupLocation,
      dropoffLocation,
      notes,
    });

    await booking.populate([
      { path: 'vehicle', select: 'name brand model images' },
      { path: 'customer', select: 'name email phone' },
    ]);

    res.status(201).json({
      success: true,
      message: 'Booking created',
      booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get my bookings (Customer)
// @route   GET /api/bookings/my
exports.getMyBookings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = { customer: req.user._id };
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate('vehicle', 'name brand model images type pricePerDay pricePerHour')
        .populate('owner', 'name email phone')
        .populate('driver', 'name phone')
        .sort('-createdAt')
        .skip(skip)
        .limit(parseInt(limit)),
      Booking.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: bookings.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get owner bookings
// @route   GET /api/bookings/owner
exports.getOwnerBookings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = { owner: req.user._id };
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate('vehicle', 'name brand model images')
        .populate('customer', 'name email phone')
        .populate('driver', 'name phone')
        .sort('-createdAt')
        .skip(skip)
        .limit(parseInt(limit)),
      Booking.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: bookings.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
exports.updateBookingStatus = async (req, res, next) => {
  try {
    const { status, cancellationReason } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: 'Booking not found' });
    }

    // Verify ownership
    const isOwner = booking.owner.toString() === req.user._id.toString();
    const isCustomer = booking.customer.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isCustomer && !isAdmin) {
      return res
        .status(403)
        .json({ success: false, message: 'Not authorized' });
    }

    // Customers can only cancel
    if (isCustomer && status !== 'cancelled') {
      return res
        .status(403)
        .json({ success: false, message: 'Customers can only cancel bookings' });
    }

    booking.status = status;
    if (cancellationReason) booking.cancellationReason = cancellationReason;

    await booking.save();
    await booking.populate([
      { path: 'vehicle', select: 'name brand model images' },
      { path: 'customer', select: 'name email phone' },
    ]);

    // Update vehicle availability
    if (status === 'completed' || status === 'cancelled') {
      await Vehicle.findByIdAndUpdate(booking.vehicle, { isAvailable: true });
    } else if (status === 'ongoing') {
      await Vehicle.findByIdAndUpdate(booking.vehicle, { isAvailable: false });
    }

    res.status(200).json({
      success: true,
      message: `Booking ${status}`,
      booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign driver to booking
// @route   PUT /api/bookings/:id/driver
exports.assignDriver = async (req, res, next) => {
  try {
    const { driverId } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: 'Booking not found' });
    }

    const isOwner = booking.owner.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res
        .status(403)
        .json({ success: false, message: 'Not authorized' });
    }

    booking.driver = driverId;
    await booking.save();
    await booking.populate('driver', 'name phone email');

    res.status(200).json({
      success: true,
      message: 'Driver assigned',
      booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings (Admin)
// @route   GET /api/bookings/admin/all
exports.getAllBookingsAdmin = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate('vehicle', 'name brand model')
        .populate('customer', 'name email')
        .populate('owner', 'name email')
        .populate('driver', 'name phone')
        .sort('-createdAt')
        .skip(skip)
        .limit(parseInt(limit)),
      Booking.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: bookings.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
exports.getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('vehicle')
      .populate('customer', 'name email phone')
      .populate('owner', 'name email phone')
      .populate('driver', 'name phone email');

    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: 'Booking not found' });
    }

    // Only involved parties can view
    const userId = req.user._id.toString();
    const isInvolved =
      booking.customer._id.toString() === userId ||
      booking.owner._id.toString() === userId ||
      (booking.driver && booking.driver._id.toString() === userId) ||
      req.user.role === 'admin';

    if (!isInvolved) {
      return res
        .status(403)
        .json({ success: false, message: 'Not authorized' });
    }

    res.status(200).json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};
