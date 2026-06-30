const User = require('../models/User');
const jwt = require('jsonwebtoken');

// JWT टोकन जनरेट करने का हेल्पर फंक्शन
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secretkey', { expiresIn: '30d' });
};

// @desc    Register user (Updated for Role-Specific Dynamic Fields)
// @route   POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    // 🚀 Destructured all incoming dynamic role fields
    const { 
      name, email, password, phone, role, address,
      licenseNumber, experienceYears, gstin, businessName 
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: 'Email already registered' });
    }

    // Only allow valid roles for self-registration
    const allowedRoles = ['customer', 'owner', 'driver'];
    const userRole = allowedRoles.includes(role) ? role : 'customer';

    // 🚀 Create base user payload
    const userPayload = {
      name,
      email,
      password,
      phone,
      address, // Customer aur baki sabke liye address field
      role: userRole,
    };

    // 🏎️ If driver, add license details to MySQL payload
    if (userRole === 'driver') {
      userPayload.licenseNumber = licenseNumber || null;
      userPayload.experienceYears = experienceYears || null;
    }

    // 💼 If owner, add business details to MySQL payload
    if (userRole === 'owner') {
      userPayload.gstin = gstin || null;
      userPayload.businessName = businessName || null;
    }

    // Save directly to MySQL via Sequelize
    const user = await User.create(userPayload);

    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        _id: user.id, 
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        avatar: user.avatar,
        ...(user.role === 'driver' && { licenseNumber: user.licenseNumber, experienceYears: user.experienceYears }),
        ...(user.role === 'owner' && { gstin: user.gstin, businessName: user.businessName })
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res
        .status(401)
        .json({ success: false, message: 'Account has been deactivated' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user.id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);

    res.status(200).json({
      success: true,
      user: {
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        avatar: user.avatar,
        isActive: user.isActive,
        ...(user.role === 'driver' && { licenseNumber: user.licenseNumber, experienceYears: user.experienceYears }),
        ...(user.role === 'owner' && { gstin: user.gstin, businessName: user.businessName })
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update profile
// @route   PUT /api/auth/profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, address, licenseNumber, experienceYears, gstin, businessName } = req.body;

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.name = name || user.name;
    user.phone = phone || user.phone;
    user.address = address || user.address;

    if (user.role === 'driver') {
      user.licenseNumber = licenseNumber || user.licenseNumber;
      user.experienceYears = experienceYears || user.experienceYears;
    }
    if (user.role === 'owner') {
      user.gstin = gstin || user.gstin;
      user.businessName = businessName || user.businessName;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated',
      user: {
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update password
// @route   PUT /api/auth/password
exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findByPk(req.user.id);

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    const token = generateToken(user.id);

    res.status(200).json({
      success: true,
      message: 'Password updated',
      token,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload avatar
// @route   PUT /api/auth/avatar
exports.uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: 'Please upload an image' });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.avatar = {
      public_id: req.file.filename,
      url: req.file.path,
    };
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Avatar uploaded',
      user: {
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
};