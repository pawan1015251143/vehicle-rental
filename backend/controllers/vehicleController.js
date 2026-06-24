const Vehicle = require('../models/Vehicle');
const cloudinary = require('../config/cloudinary');

// @desc    Create vehicle (Owner)
// @route   POST /api/vehicles
exports.createVehicle = async (req, res, next) => {
  try {
    req.body.owner = req.user._id;

    // Handle uploaded images
    if (req.files && req.files.length > 0) {
      req.body.images = req.files.map((file) => ({
        public_id: file.filename,
        url: file.path,
      }));
    }

    const vehicle = await Vehicle.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Vehicle added. Pending admin approval.',
      vehicle,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all approved vehicles (Public)
// @route   GET /api/vehicles
exports.getVehicles = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 12,
      type,
      city,
      minPrice,
      maxPrice,
      fuelType,
      transmission,
      seats,
      search,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    const query = { status: 'approved', isAvailable: true };

    if (type) query.type = type;
    if (city) query['location.city'] = new RegExp(city, 'i');
    if (fuelType) query.fuelType = fuelType;
    if (transmission) query.transmission = transmission;
    if (seats) query.seats = { $gte: parseInt(seats) };
    if (minPrice || maxPrice) {
      query.pricePerDay = {};
      if (minPrice) query.pricePerDay.$gte = parseInt(minPrice);
      if (maxPrice) query.pricePerDay.$lte = parseInt(maxPrice);
    }
    if (search) {
      query.$text = { $search: search };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortObj = {};
    sortObj[sortBy] = order === 'asc' ? 1 : -1;

    const [vehicles, total] = await Promise.all([
      Vehicle.find(query)
        .populate('owner', 'name email phone avatar')
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit)),
      Vehicle.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: vehicles.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      vehicles,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single vehicle
// @route   GET /api/vehicles/:id
exports.getVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id).populate(
      'owner',
      'name email phone avatar'
    );

    if (!vehicle) {
      return res
        .status(404)
        .json({ success: false, message: 'Vehicle not found' });
    }

    res.status(200).json({ success: true, vehicle });
  } catch (error) {
    next(error);
  }
};

// @desc    Update vehicle (Owner)
// @route   PUT /api/vehicles/:id
exports.updateVehicle = async (req, res, next) => {
  try {
    let vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res
        .status(404)
        .json({ success: false, message: 'Vehicle not found' });
    }

    // Only owner or admin can update
    if (
      vehicle.owner.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res
        .status(403)
        .json({ success: false, message: 'Not authorized' });
    }

    // Handle new images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => ({
        public_id: file.filename,
        url: file.path,
      }));
      req.body.images = [...(vehicle.images || []), ...newImages];
    }

    vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Vehicle updated',
      vehicle,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete vehicle (Owner/Admin)
// @route   DELETE /api/vehicles/:id
exports.deleteVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res
        .status(404)
        .json({ success: false, message: 'Vehicle not found' });
    }

    if (
      vehicle.owner.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res
        .status(403)
        .json({ success: false, message: 'Not authorized' });
    }

    // Delete images from cloudinary
    for (const img of vehicle.images) {
      if (img.public_id) {
        await cloudinary.uploader.destroy(img.public_id);
      }
    }

    await Vehicle.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Vehicle deleted',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get owner's vehicles
// @route   GET /api/vehicles/owner/me
exports.getMyVehicles = async (req, res, next) => {
  try {
    const vehicles = await Vehicle.find({ owner: req.user._id }).sort(
      '-createdAt'
    );

    res.status(200).json({
      success: true,
      count: vehicles.length,
      vehicles,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve/Reject vehicle (Admin)
// @route   PUT /api/vehicles/:id/approval
exports.updateVehicleApproval = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid status' });
    }

    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!vehicle) {
      return res
        .status(404)
        .json({ success: false, message: 'Vehicle not found' });
    }

    res.status(200).json({
      success: true,
      message: `Vehicle ${status}`,
      vehicle,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all vehicles (Admin - including pending)
// @route   GET /api/vehicles/admin/all
exports.getAllVehiclesAdmin = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [vehicles, total] = await Promise.all([
      Vehicle.find(query)
        .populate('owner', 'name email phone')
        .sort('-createdAt')
        .skip(skip)
        .limit(parseInt(limit)),
      Vehicle.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: vehicles.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      vehicles,
    });
  } catch (error) {
    next(error);
  }
};
