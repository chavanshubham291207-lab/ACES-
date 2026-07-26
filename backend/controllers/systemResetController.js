const mongoose = require('mongoose');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const AttendanceSession = require('../models/AttendanceSession');
const Task = require('../models/Task');
const Notification = require('../models/Notification');
const Event = require('../models/Event');
const Certificate = require('../models/Certificate');
const Position = require('../models/Position');
const Team = require('../models/Team');
const ActivityLog = require('../models/ActivityLog');

// Check if Gallery model exists
let Gallery;
try {
  Gallery = require('../models/Gallery');
} catch (e) {
  Gallery = null;
}

// @desc    Reset entire ACES system data for fresh production deployment
// @route   POST /api/admin/reset-system
// @access  Private (Super Admin Only)
const resetSystemData = async (req, res, next) => {
  try {
    // 1. Strict Role Authorization Enforcement
    if (req.user.role !== 'Super Admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Only the Super Admin can perform a system reset.'
      });
    }

    // 2. Clear all collections except Super Admin user
    await Attendance.deleteMany({});
    await AttendanceSession.deleteMany({});
    await Task.deleteMany({});
    await Notification.deleteMany({});
    await Event.deleteMany({});
    await Certificate.deleteMany({});
    await Position.deleteMany({});
    await Team.deleteMany({});
    await ActivityLog.deleteMany({});

    if (Gallery) {
      await Gallery.deleteMany({});
    }

    // 3. Delete all users EXCEPT the active Super Admin performing reset
    await User.deleteMany({ _id: { $ne: req.user._id } });

    // 4. Reset Super Admin user contribution points and unlink old team/position
    const superAdmin = await User.findById(req.user._id);
    if (superAdmin) {
      superAdmin.contributionPoints = 0;
      superAdmin.team = null;
      superAdmin.position = null;
      superAdmin.status = 'Active';
      superAdmin.isActive = true;
      await superAdmin.save();
    }

    // 5. Log activity
    await ActivityLog.create({
      user: req.user._id,
      userName: req.user.name,
      action: 'System Reset Completed',
      module: 'System',
      details: 'All demo and test data cleared from MongoDB for fresh production deployment.'
    });

    res.json({
      success: true,
      message: 'System reset completed successfully. The portal is now ready for new data.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  resetSystemData
};
