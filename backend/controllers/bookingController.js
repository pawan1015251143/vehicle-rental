const { Op } = require('sequelize');
const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');
const User = require('../models/User');

const formatUser = (user) => user ? {
  _id: user.id,
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
} : null;

const formatVehicle = (vehicle) => vehicle ? {
  ...vehicle.toJSON(),
  _id: vehicle.id,
  seats: vehicle.seatingCapacity,
  registrationNumber: vehicle.vehicleNumber,
} : null;

const formatBooking = async (booking) => {
  const data = booking.toJSON();
  const [vehicle, customer, driver] = await Promise.all([
    Vehicle.findByPk(data.vehicleId),
    User.findByPk(data.userId),
    data.driverId ? User.findByPk(data.driverId) : null,
  ]);
  const owner = vehicle ? await User.findByPk(vehicle.ownerId) : null;

  return {
    ...data,
    _id: data.id,
    totalAmount: Number(data.totalPrice),
    vehicle: formatVehicle(vehicle),
    customer: formatUser(customer),
    owner: formatUser(owner),
    driver: formatUser(driver),
  };
};

exports.createBooking = async (req, res, next) => {
  try {
    const requestedVehicleId = req.body.vehicleId || req.body.vehicle;
    const {
      bookingType = 'daily',
      startDate,
      endDate,
      pickupLocation,
      dropoffLocation,
      notes,
    } = req.body;

    if (!requestedVehicleId || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle, start date, and end date are required',
      });
    }

    const vehicle = await Vehicle.findByPk(requestedVehicleId);
    if (!vehicle || !vehicle.isAvailable || vehicle.status === 'rejected') {
      return res.status(400).json({
        success: false,
        message: 'Vehicle is not available for booking',
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalHours = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60)));
    const totalDays = Math.max(1, Math.ceil(totalHours / 24));
    const hourlyAmount = Number(vehicle.pricePerHour || vehicle.pricePerDay);
    const dailyAmount = Number(vehicle.pricePerDay);
    const totalPrice = Number(req.body.totalPrice)
      || Number(req.body.totalAmount)
      || (bookingType === 'hourly' ? totalHours * hourlyAmount : totalDays * dailyAmount);

    const booking = await Booking.create({
      userId: req.user.id,
      vehicleId: requestedVehicleId,
      bookingType,
      startDate,
      endDate,
      totalHours: bookingType === 'hourly' ? totalHours : null,
      totalDays: bookingType === 'hourly' ? null : totalDays,
      totalPrice,
      pickupLocation,
      dropoffLocation,
      notes,
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      message: 'Booking initiated successfully',
      booking: await formatBooking(booking),
    });
  } catch (error) {
    next(error);
  }
};

exports.getMyBookings = async (req, res, next) => {
  try {
    const { status } = req.query;
    const where = { userId: req.user.id };
    if (status) where.status = status;

    const bookings = await Booking.findAll({ where, order: [['createdAt', 'DESC']] });
    const formattedBookings = await Promise.all(bookings.map(formatBooking));

    res.status(200).json({
      success: true,
      count: formattedBookings.length,
      total: formattedBookings.length,
      totalPages: 1,
      bookings: formattedBookings,
    });
  } catch (error) {
    next(error);
  }
};

exports.getOwnerBookings = async (req, res, next) => {
  try {
    const { status } = req.query;
    const ownerVehicles = await Vehicle.findAll({
      where: { ownerId: req.user.id },
      attributes: ['id'],
    });
    const vehicleIds = ownerVehicles.map((vehicle) => vehicle.id);
    const where = { vehicleId: { [Op.in]: vehicleIds } };
    if (status) where.status = status;

    const bookings = vehicleIds.length
      ? await Booking.findAll({ where, order: [['createdAt', 'DESC']] })
      : [];
    const formattedBookings = await Promise.all(bookings.map(formatBooking));

    res.status(200).json({
      success: true,
      count: formattedBookings.length,
      total: formattedBookings.length,
      totalPages: 1,
      bookings: formattedBookings,
    });
  } catch (error) {
    next(error);
  }
};

exports.getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const vehicle = await Vehicle.findByPk(booking.vehicleId);
    const isCustomer = booking.userId === req.user.id;
    const isOwner = vehicle?.ownerId === req.user.id;
    const isDriver = booking.driverId === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isCustomer && !isOwner && !isDriver && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.status(200).json({ success: true, booking: await formatBooking(booking) });
  } catch (error) {
    next(error);
  }
};

exports.updateBookingStatus = async (req, res, next) => {
  try {
    const { status, cancellationReason } = req.body;
    const allowedStatuses = ['pending', 'confirmed', 'ongoing', 'cancelled', 'completed'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid booking status' });
    }

    const booking = await Booking.findByPk(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const vehicle = await Vehicle.findByPk(booking.vehicleId);
    const isCustomer = booking.userId === req.user.id;
    const isOwner = vehicle?.ownerId === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isCustomer && !isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (isCustomer && !isAdmin && status !== 'cancelled') {
      return res.status(403).json({ success: false, message: 'Customers can only cancel bookings' });
    }

    booking.status = status;
    if (cancellationReason) booking.cancellationReason = cancellationReason;
    await booking.save();

    if (vehicle) {
      if (status === 'ongoing') vehicle.isAvailable = false;
      if (status === 'completed' || status === 'cancelled') vehicle.isAvailable = true;
      await vehicle.save();
    }

    res.status(200).json({
      success: true,
      message: `Booking ${status}`,
      booking: await formatBooking(booking),
    });
  } catch (error) {
    next(error);
  }
};

exports.assignDriver = async (req, res, next) => {
  try {
    const { driverId } = req.body;
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const vehicle = await Vehicle.findByPk(booking.vehicleId);
    if (vehicle?.ownerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    booking.driverId = driverId;
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Driver assigned',
      booking: await formatBooking(booking),
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllBookingsAdmin = async (req, res, next) => {
  try {
    const { status } = req.query;
    const where = {};
    if (status) where.status = status;

    const bookings = await Booking.findAll({ where, order: [['createdAt', 'DESC']] });
    const formattedBookings = await Promise.all(bookings.map(formatBooking));

    res.status(200).json({
      success: true,
      count: formattedBookings.length,
      total: formattedBookings.length,
      totalPages: 1,
      bookings: formattedBookings,
    });
  } catch (error) {
    next(error);
  }
};
