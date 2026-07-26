const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const mongoose = require('mongoose');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const generateToken = require('../utils/generateToken');

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const ADMIN_ROLES = [
  'Super Admin',
  'President',
  'Vice President',
  'Secretary',
  'Treasurer',
  'Team Lead',
  'Faculty Coordinator'
];

// @desc    Dynamic Authentication for all users in MongoDB
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    // 1. Verify MongoDB connection status
    const isConnected = mongoose.connection.readyState === 1;
    if (!isConnected) {
      console.error('❌ [Auth Error] Database disconnected during login attempt.');
      return res.status(503).json({
        success: false,
        message: 'Database connection unavailable. Please try again in a few seconds.'
      });
    }

    const { email, password, loginType } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    // 2. Extract & Validate loginType
    const normalizedLoginType = (loginType || 'member').toLowerCase().trim();
    if (!['admin', 'member'].includes(normalizedLoginType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid login type. Must be either "admin" or "member".'
      });
    }

    // 3. Normalize email using trim().toLowerCase()
    const normalizedEmail = email.trim().toLowerCase();

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({ success: false, message: 'Invalid email format.' });
    }

    // 4. Query single MongoDB users collection using normalized email without filtering by role
    const user = await User.findOne({ email: normalizedEmail }).populate('team position');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Email not found'
      });
    }

    // 5. Verify password using bcrypt.compare()
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password'
      });
    }

    // 6. Verify account status
    if (user.isActive === false || (user.status && user.status.toLowerCase() === 'inactive')) {
      return res.status(403).json({
        success: false,
        message: 'Account deactivated'
      });
    }

    // 7. Role Isolation Enforcement based on loginType
    const isUserAdmin = ADMIN_ROLES.includes(user.role);

    if (normalizedLoginType === 'admin' && !isUserAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Member credentials cannot be used for Admin login.'
      });
    }

    if (normalizedLoginType === 'member' && isUserAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin credentials cannot be used for Member login. Please switch to Admin Login tab.'
      });
    }

    // 8. Generate JWT token & return response
    const token = generateToken(user._id, user.role);

    ActivityLog.create({
      user: user._id,
      userName: user.name,
      action: 'Login',
      module: 'Auth',
      details: `Successful ${normalizedLoginType} login for ${user.email} (${user.role})`,
      ip: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1'
    }).catch(err => console.error('Activity Log Error:', err.message));

    return res.json({
      success: true,
      message: 'Login successful.',
      user: {
        _id: user._id,
        name: user.name,
        fullName: user.name,
        email: user.email,
        rollNumber: user.rollNumber,
        role: user.role,
        department: user.department,
        year: user.year,
        team: user.team,
        position: user.position,
        profilePhoto: user.profilePhoto || '',
        isActive: true,
        status: 'Active',
        contributionPoints: user.contributionPoints
      },
      token
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Register a new member directly into MongoDB users collection
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const isConnected = mongoose.connection.readyState === 1;
    if (process.env.NODE_ENV !== 'production') {
      console.log(`📌 [Register Debug] MongoDB Connected: ${isConnected}`);
    }

    if (!isConnected) {
      return res.status(503).json({ success: false, message: 'Database connection unavailable.' });
    }

    const { name, email, password, rollNumber, department, year, profilePhoto } = req.body;

    if (process.env.NODE_ENV !== 'production') {
      console.log(`📌 [Register Debug] Exact email received: '${email}'`);
    }

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (process.env.NODE_ENV !== 'production') {
      console.log(`📌 [Register Debug] Normalized email: '${normalizedEmail}'`);
    }

    const generatedRoll = rollNumber ? rollNumber.trim().toUpperCase() : `MEM-${Math.floor(10000 + Math.random() * 90000)}`;

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({ success: false, message: 'Invalid email format.' });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists.' });
    }

    // Hash password with bcrypt before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      rollNumber: generatedRoll,
      department: department || 'Computer Engineering',
      year: year || 'TE',
      role: 'Member',
      profilePhoto: profilePhoto || '',
      isActive: true,
      status: 'Active'
    });

    if (process.env.NODE_ENV !== 'production') {
      console.log(`✅ [Register Debug] User Saved Successfully`);
      console.log(`📌 [Register Debug] Saved User ID: ${user._id}`);
      console.log(`📌 [Register Debug] Saved Email: ${user.email}`);

      // Verify the user document is actually created in the users collection
      const verifiedUser = await User.findById(user._id);
      console.log(`📌 [Register Debug] Verification - User exists in DB: ${!!verifiedUser}`);
    }

    const populated = await User.findById(user._id).select('-password').populate('team position');

    res.status(201).json({
      success: true,
      message: 'Member registered successfully in MongoDB.',
      user: populated,
      token: generateToken(user._id, user.role)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    One-Time Initial Super Admin Setup
// @route   POST /api/auth/setup-admin
// @access  Public
const setupAdmin = async (req, res, next) => {
  try {
    const superAdminExists = await User.findOne({ role: 'Super Admin' });
    if (superAdminExists) {
      return res.status(403).json({
        success: false,
        message: 'Public admin setup is disabled. Super Admin account already exists in MongoDB.'
      });
    }

    const { name, email, password, role = 'Super Admin', profilePhoto, setupKey } = req.body;

    if (setupKey !== (process.env.ADMIN_SETUP_KEY || 'ACES_ADMIN_SETUP_2026')) {
      return res.status(403).json({ success: false, message: 'Unauthorized setup key.' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists in MongoDB.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const admin = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      rollNumber: `ADM-${Math.floor(10000 + Math.random() * 90000)}`,
      department: 'Computer Engineering',
      year: 'BE',
      role: ADMIN_ROLES.includes(role) ? role : 'Super Admin',
      profilePhoto: profilePhoto || '',
      isActive: true,
      status: 'Active'
    });

    res.status(201).json({
      success: true,
      message: 'Initial Super Admin created successfully in MongoDB.',
      admin: {
        _id: admin._id,
        name: admin.name,
        fullName: admin.name,
        email: admin.email,
        role: admin.role,
        profilePhoto: admin.profilePhoto || '',
        isActive: true,
        status: 'Active'
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Request password reset token
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }
    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Email not found' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes
    await user.save();

    res.json({
      success: true,
      message: 'Password reset token generated successfully.',
      resetToken
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password using token
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ success: false, message: 'Token and new password are required.' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token.' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ success: true, message: 'Password reset successfully.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged-in user profile from MongoDB
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password').populate('team position');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found.' });
    }
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found in MongoDB.' });
    }

    if (req.body.name) user.name = req.body.name.trim();
    if (req.body.phone) user.phone = req.body.phone.trim();
    if (req.body.linkedin) user.linkedin = req.body.linkedin.trim();
    if (req.body.github) user.github = req.body.github.trim();
    if (req.body.profilePhoto !== undefined) user.profilePhoto = req.body.profilePhoto;

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }

    await user.save();
    const populated = await User.findById(user._id).select('-password').populate('team position');

    res.json({ success: true, user: populated });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  loginUser,
  registerUser,
  setupAdmin,
  forgotPassword,
  resetPassword,
  getMe,
  updateProfile
};
