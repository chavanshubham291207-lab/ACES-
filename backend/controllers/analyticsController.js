const User = require('../models/User');
const Team = require('../models/Team');
const Position = require('../models/Position');
const Attendance = require('../models/Attendance');
const AttendanceSession = require('../models/AttendanceSession');
const Event = require('../models/Event');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get public stats for Landing Page directly from MongoDB
// @route   GET /api/analytics/public-stats
// @access  Public
const getPublicStats = async (req, res, next) => {
  try {
    const totalMembers = await User.countDocuments();
    const totalTeams = await Team.countDocuments();
    const totalExecutiveMembers = await Position.countDocuments();
    const totalEvents = await Event.countDocuments();

    res.json({
      success: true,
      stats: {
        totalMembers,
        totalTeams,
        totalExecutiveMembers,
        totalEvents
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get system dashboard analytics & reports
// @route   GET /api/analytics/dashboard
// @access  Private (Admin/Lead)
const getDashboardAnalytics = async (req, res, next) => {
  try {
    const totalMembers = await User.countDocuments();
    const totalTeams = await Team.countDocuments();
    const totalSessions = await AttendanceSession.countDocuments({ isDeleted: false });
    const activeSessions = await AttendanceSession.countDocuments({ isActive: true, isDeleted: false });
    const totalEvents = await Event.countDocuments();
    const executiveMembers = await Position.countDocuments();

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const attendanceToday = await Attendance.countDocuments({ scanTime: { $gte: startOfToday } });

    const totalAttendanceRecords = await Attendance.countDocuments();
    const presentRecords = await Attendance.countDocuments({ status: 'Present' });
    const lateRecords = await Attendance.countDocuments({ status: 'Late' });

    const totalPossibleAttendance = totalMembers * totalSessions;
    const overallAttendancePercentage = totalPossibleAttendance > 0 
      ? Number(((totalAttendanceRecords / totalPossibleAttendance) * 100).toFixed(1))
      : 0;

    const teams = await Team.find();
    const teamPerformance = await Promise.all(
      teams.map(async (team) => {
        const memberCount = await User.countDocuments({ team: team._id });
        const teamMembers = await User.find({ team: team._id }).select('_id');
        const teamMemberIds = teamMembers.map(m => m._id);

        const attendedCount = await Attendance.countDocuments({ member: { $in: teamMemberIds } });
        const avgContributionPoints = await User.aggregate([
          { $match: { team: team._id } },
          { $group: { _id: null, avgPoints: { $avg: '$contributionPoints' } } }
        ]);

        return {
          teamName: team.name,
          memberCount,
          totalAttended: attendedCount,
          avgPoints: avgContributionPoints[0] ? Math.round(avgContributionPoints[0].avgPoints) : 0
        };
      })
    );

    const mostActiveMembers = await User.find()
      .select('name email rollNumber contributionPoints profilePhoto role team')
      .populate('team', 'name')
      .sort({ contributionPoints: -1 })
      .limit(5);

    const leastActiveMembers = await User.find()
      .select('name email rollNumber contributionPoints profilePhoto role team')
      .populate('team', 'name')
      .sort({ contributionPoints: 1 })
      .limit(5);

    const monthlyStats = await AttendanceSession.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: { $month: "$startTime" },
          sessions: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]).then(results => {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return results.map(r => ({
        month: monthNames[r._id - 1] || `Month ${r._id}`,
        sessions: r.sessions,
        avgAttendance: 0
      }));
    });

    res.json({
      success: true,
      summary: {
        totalMembers,
        totalTeams,
        totalSessions,
        activeSessions,
        attendanceToday,
        pendingTasks: totalEvents,
        executiveMembers,
        totalEvents,
        overallAttendancePercentage,
        presentRecords,
        lateRecords
      },
      teamPerformance,
      mostActiveMembers,
      leastActiveMembers,
      monthlyStats
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get activity audit logs
// @route   GET /api/analytics/activity-logs
// @access  Private (Super Admin / President)
const getActivityLogs = async (req, res, next) => {
  try {
    const { module: moduleName, search, page = 1, limit = 50 } = req.query;
    let query = {};

    if (moduleName) query.module = moduleName;
    if (search) {
      query.$or = [
        { userName: { $regex: search, $options: 'i' } },
        { action: { $regex: search, $options: 'i' } },
        { details: { $regex: search, $options: 'i' } }
      ];
    }

    const count = await ActivityLog.countDocuments(query);
    const logs = await ActivityLog.find(query)
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      count,
      pages: Math.ceil(count / limit),
      logs
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPublicStats,
  getDashboardAnalytics,
  getActivityLogs
};
