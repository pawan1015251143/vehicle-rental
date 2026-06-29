const { Op } = require('sequelize');
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

const formatVehicle = async (vehicle) => {
  const data = vehicle.toJSON();
  const owner = data.ownerId ? await User.findByPk(data.ownerId) : null;

  return {
    ...data,
    _id: data.id,
    seats: data.seatingCapacity,
    registrationNumber: data.vehicleNumber,
    owner: formatUser(owner),
  };
};

const normalizeVehiclePayload = (body, files = []) => {
  const location = body.location || {
    city: body['location[city]'] || body.city,
    state: body['location[state]'] || body.state,
    address: body['location[address]'] || body.address,
  };

  const uploadedImages = files.map((file) => ({
    public_id: file.filename,
    url: file.path,
  }));

  const existingImages = body.imageUrl ? [{ url: body.imageUrl }] : [];
  const features = Array.isArray(body.features)
    ? body.features
    : typeof body.features === 'string'
      ? body.features.split(',').map((feature) => feature.trim()).filter(Boolean)
      : undefined;

  return {
    name: body.name,
    brand: body.brand,
    model: body.model,
    year: body.year || null,
    type: body.type,
    vehicleNumber: body.vehicleNumber || body.registrationNumber,
    pricePerHour: body.pricePerHour || null,
    pricePerDay: body.pricePerDay,
    fuelType: body.fuelType,
    transmission: body.transmission,
    seatingCapacity: body.seatingCapacity || body.seats,
    images: uploadedImages.length ? uploadedImages : existingImages,
    features,
    description: body.description,
    location,
  };
};

exports.getVehicles = async (req, res, next) => {
  try {
    const {
      type,
      fuelType,
      transmission,
      city,
      location,
      search,
      minPrice,
      maxPrice,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    const where = { isAvailable: true };
    if (type) where.type = type;
    if (fuelType) where.fuelType = fuelType;
    if (transmission) where.transmission = transmission;
    if (minPrice || maxPrice) {
      where.pricePerDay = {};
      if (minPrice) where.pricePerDay[Op.gte] = Number(minPrice);
      if (maxPrice) where.pricePerDay[Op.lte] = Number(maxPrice);
    }
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { brand: { [Op.like]: `%${search}%` } },
        { model: { [Op.like]: `%${search}%` } },
      ];
    }

    const offset = (Number(page) - 1) * Number(limit);
    const { rows, count } = await Vehicle.findAndCountAll({
      where,
      order: [[sortBy, order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC']],
      offset,
      limit: Number(limit),
    });

    let vehicles = await Promise.all(rows.map(formatVehicle));
    const cityFilter = city || location;
    if (cityFilter) {
      vehicles = vehicles.filter((vehicle) => {
        const vehicleLocation = vehicle.location;
        if (typeof vehicleLocation === 'string') return vehicleLocation.toLowerCase().includes(cityFilter.toLowerCase());
        return vehicleLocation?.city?.toLowerCase().includes(cityFilter.toLowerCase());
      });
    }

    res.status(200).json({
      success: true,
      count: vehicles.length,
      total: count,
      totalPages: Math.ceil(count / Number(limit)),
      currentPage: Number(page),
      vehicles,
    });
  } catch (error) {
    next(error);
  }
};

exports.getVehicleById = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    res.status(200).json({
      success: true,
      vehicle: await formatVehicle(vehicle),
    });
  } catch (error) {
    next(error);
  }
};

exports.createVehicle = async (req, res, next) => {
  try {
    const payload = normalizeVehiclePayload(req.body, req.files);
    payload.ownerId = req.user.id;
    payload.status = req.user.role === 'admin' ? 'approved' : 'pending';

    const vehicle = await Vehicle.create(payload);

    res.status(201).json({
      success: true,
      message: 'Vehicle added successfully',
      vehicle: await formatVehicle(vehicle),
    });
  } catch (error) {
    next(error);
  }
};

exports.updateVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }
    if (vehicle.ownerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const payload = normalizeVehiclePayload(req.body, req.files);
    Object.keys(payload).forEach((key) => payload[key] === undefined && delete payload[key]);
    await vehicle.update(payload);

    res.status(200).json({
      success: true,
      message: 'Vehicle updated',
      vehicle: await formatVehicle(vehicle),
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }
    if (vehicle.ownerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await vehicle.destroy();
    res.status(200).json({ success: true, message: 'Vehicle deleted' });
  } catch (error) {
    next(error);
  }
};

exports.getMyVehicles = async (req, res, next) => {
  try {
    const vehicles = await Vehicle.findAll({
      where: { ownerId: req.user.id },
      order: [['createdAt', 'DESC']],
    });
    const formattedVehicles = await Promise.all(vehicles.map(formatVehicle));

    res.status(200).json({
      success: true,
      count: formattedVehicles.length,
      vehicles: formattedVehicles,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllVehiclesAdmin = async (req, res, next) => {
  try {
    const vehicles = await Vehicle.findAll({ order: [['createdAt', 'DESC']] });
    const formattedVehicles = await Promise.all(vehicles.map(formatVehicle));

    res.status(200).json({
      success: true,
      count: formattedVehicles.length,
      total: formattedVehicles.length,
      totalPages: 1,
      vehicles: formattedVehicles,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateVehicleApproval = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid vehicle status' });
    }

    const vehicle = await Vehicle.findByPk(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    vehicle.status = status;
    await vehicle.save();

    res.status(200).json({
      success: true,
      message: `Vehicle ${status}`,
      vehicle: await formatVehicle(vehicle),
    });
  } catch (error) {
    next(error);
  }
};

exports.getVehicle = exports.getVehicleById;
