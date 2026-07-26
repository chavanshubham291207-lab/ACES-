const User = require('../models/User');

// @desc    Get admin profile details
// @route   GET /api/admin/profile
// @access  Private (Admin)
const getAdminProfile = async (req, res, next) => {
  try {
    const admin = await User.findById(req.user._id)
      .select('-password')
      .populate('team position');

    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin account not found' });
    }

    res.json({ success: true, user: admin });
  } catch (error) {
    next(error);
  }
};

// @desc    Update admin profile (name, phone, team, position, photo)
// @route   PUT /api/admin/profile
// @access  Private (Admin)
const updateAdminProfile = async (req, res, next) => {
  try {
    const { name, phone, team, position, profilePhoto } = req.body;
    const admin = await User.findById(req.user._id);

    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin account not found' });
    }

    if (name) admin.name = name.trim();
    if (phone !== undefined) admin.phone = phone.trim();
    if (team !== undefined) admin.team = team || null;
    if (position !== undefined) admin.position = position || null;
    if (profilePhoto !== undefined) admin.profilePhoto = profilePhoto;

    await admin.save();
    const updated = await User.findById(admin._id)
      .select('-password')
      .populate('team position');

    res.json({
      success: true,
      message: 'Admin profile updated successfully in MongoDB.',
      user: updated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload / Update admin profile photo
// @route   POST /api/admin/profile/photo
// @access  Private (Admin)
const uploadAdminPhoto = async (req, res, next) => {
  try {
    const { profilePhoto } = req.body;

    if (!profilePhoto) {
      return res.status(400).json({ success: false, message: 'Profile photo data is required.' });
    }

    const admin = await User.findById(req.user._id);
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin account not found' });
    }

    admin.profilePhoto = profilePhoto;
    await admin.save();

    const updated = await User.findById(admin._id)
      .select('-password')
      .populate('team position');

    res.json({
      success: true,
      message: 'Profile photo uploaded successfully to MongoDB.',
      profilePhoto: updated.profilePhoto,
      user: updated
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminProfile,
  updateAdminProfile,
  uploadAdminPhoto
};
