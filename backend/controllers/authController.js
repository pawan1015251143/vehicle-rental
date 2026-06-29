const User = require('../models/User');
const jwt = require('jsonwebtoken');

// JWT टोकन जनरेट करने का हेल्पर फंक्शन (Mongoose मॉडल मेथड की जगह)
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secretkey', { expiresIn: '30d' });
};

// @desc    Register user
// @route   POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role } = req.body;

    // Check if user already exists (Sequelize structure)
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: 'Email already registered' });
    }

    // Only allow valid roles for self-registration
    const allowedRoles = ['customer', 'owner', 'driver'];
    const userRole = allowedRoles.includes(role) ? role : 'customer';

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: userRole,
    });

    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        _id: user.id, // फ्रंटएंड कंपैटिबिलिटी के लिए id को _id बनाकर भेजा है
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

    // MySQL में findOne के लिए 'where' ऑब्जेक्ट का उपयोग होता है
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

    // पासवर्ड कंपेयर करने के लिए हमारा नया Sequelize प्रोटोटाइप मेथड
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
    // req.user.id को मिडलवेयर से रीड करेंगे (पक्का करें मिडलवेयर में req.user = user सेट हो)
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
        isActive: user.isActive
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
    const { name, phone, address } = req.body;

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Sequelize में अपडेट करने का तरीका
    user.name = name || user.name;
    user.phone = phone || user.phone;
    user.address = address || user.address;
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

    // नया पासवर्ड डालने पर हमारे hook के द्वारा यह अपने आप हैश हो जाएगा
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

    // JSON डेटा टाइप के रूप में इमेज ऑब्जेक्ट को सेव करना
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