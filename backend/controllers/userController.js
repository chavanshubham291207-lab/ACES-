const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/User');

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

// @desc    Get all users (Members & Admins) with search, filter, pagination
// @route   GET /api/users
// @access  Private (Admin)
const getUsers = async (req, res, next) => {
  try {
    const { search, team, role, status, year, isExecutive, page = 1, limit = 50 } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { rollNumber: { $regex: search, $options: 'i' } }
      ];
    }

    if (team) query.team = team;
    if (role) query.role = role;
    if (status) query.status = { $regex: new RegExp(`^${status}$`, 'i') };
    if (year) query.year = year;

    if (isExecutive === 'true') {
      query.role = { $in: ADMIN_ROLES };
    }

    const count = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .populate('team position createdBy', 'name email role')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      count,
      pages: Math.ceil(count / limit),
      page: Number(page),
      users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('team position createdBy', 'name email role');
      
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new Member or Admin (Created Active by default)
// @route   POST /api/users
// @access  Private (Super Admin / President)
const createUser = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ success: false, message: 'Database connection unavailable.' });
    }

    const {
      name,
      email,
      password,
      phone,
      rollNumber,
      department,
      year,
      team,
      position,
      role = 'Member',
      profilePhoto,
      linkedin,
      github
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({ success: false, message: 'Invalid email format.' });
    }

    // Role Security Enforcement
    if (ADMIN_ROLES.includes(role)) {
      if (!['Super Admin', 'President'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized. Only Super Admin or President can create Admin accounts.'
        });
      }
    }

    const generatedRoll = rollNumber ? rollNumber.trim().toUpperCase() : `ADM-${Math.floor(10000 + Math.random() * 90000)}`;

    console.log(`📌 [Admin Create Debug] Checking existing user for email: '${normalizedEmail}'`);
    const userExists = await User.findOne({ email: normalizedEmail });

    if (userExists) {
      return res.status(400).json({ success: false, message: 'User with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      phone: phone || '',
      rollNumber: generatedRoll,
      department: department || 'Computer Engineering',
      year: year || 'BE',
      team: team || null,
      position: position || null,
      role,
      profilePhoto: profilePhoto || '',
      linkedin: linkedin || '',
      github: github || '',
      isActive: true,
      status: 'Active',
      createdBy: req.user?._id || null
    });

    console.log(`✅ [Admin Create Debug] User Created in MongoDB collection 'users': ${user.name} (${user.email})`);

    const populated = await User.findById(user._id)
      .select('-password')
      .populate('team position createdBy', 'name email role');

    res.status(201).json({ success: true, message: 'User created successfully.', user: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Member or Admin
// @route   PUT /api/users/:id
// @access  Private (Admin)
const updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (req.body.role && ADMIN_ROLES.includes(req.body.role)) {
      if (!['Super Admin', 'President'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized. Only Super Admin can assign Admin roles.'
        });
      }
    }

    if (req.body.email && req.body.email.trim().toLowerCase() !== user.email) {
      const normalizedEmail = req.body.email.trim().toLowerCase();
      const duplicate = await User.findOne({ email: normalizedEmail });
      if (duplicate) {
        return res.status(400).json({ success: false, message: 'Email address already in use.' });
      }
      user.email = normalizedEmail;
    }

    const fields = ['name', 'phone', 'rollNumber', 'department', 'year', 'team', 'position', 'role', 'profilePhoto', 'linkedin', 'github', 'isActive', 'status', 'contributionPoints'];

    fields.forEach(field => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field] === '' ? null : req.body[field];
      }
    });

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }

    await user.save();
    const updatedUser = await User.findById(user._id)
      .select('-password')
      .populate('team position createdBy', 'name email role');

    res.json({ success: true, message: 'User updated successfully.', user: updatedUser });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user status (Activate / Deactivate)
// @route   PUT /api/users/:id/status
// @access  Private (Admin)
const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'Super Admin' && user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot deactivate your own Super Admin account.' });
    }

    user.isActive = !user.isActive;
    user.status = user.isActive ? 'Active' : 'Inactive';
    await user.save();

    res.json({
      success: true,
      message: `Account status for ${user.name} updated to ${user.status}.`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive,
        status: user.status
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete User
// @route   DELETE /api/users/:id
// @access  Private (Admin)
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'Super Admin' && user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own Super Admin account.' });
    }

    if (ADMIN_ROLES.includes(user.role) && !['Super Admin', 'President'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Only Super Admin can delete Admin accounts.' });
    }

    await user.deleteOne();
    res.json({ success: true, message: 'Account removed successfully from MongoDB.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  toggleUserStatus,
  deleteUser
};
