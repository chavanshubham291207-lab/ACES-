const jwt = require('jsonwebtoken');
const AttendanceSession = require('../models/AttendanceSession');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const Team = require('../models/Team');
const Position = require('../models/Position');
const { getClientBaseUrl } = require('../utils/getNetworkIp');

const JWT_SECRET = process.env.JWT_SECRET || 'aces_super_secret_jwt_key_2026';

// @desc    Create attendance session with dynamic network IP QR URL
// @route   POST /api/attendance/sessions
// @access  Private (Admin/Lead/Secretary)
const createSession = async (req, res, next) => {
  try {
    const {
      meetingTitle,
      meetingType,
      team,
      venue,
      startTime,
      endTime,
      qrExpiryMinutes = 30,
      description
    } = req.body;

    const qrExpiryTime = new Date(Date.now() + qrExpiryMinutes * 60 * 1000);

    const session = await AttendanceSession.create({
      meetingTitle,
      meetingType: meetingType || 'General Body',
      team: team || null,
      venue,
      startTime: startTime ? new Date(startTime) : new Date(),
      endTime: endTime ? new Date(endTime) : new Date(Date.now() + 60 * 60 * 1000),
      qrExpiryTime,
      qrToken: 'PENDING',
      description: description || '',
      createdBy: req.user._id,
      isDeleted: false
    });

    const signedQRToken = jwt.sign(
      { sessionId: session._id, expiresAt: qrExpiryTime.getTime() },
      JWT_SECRET,
      { expiresIn: `${qrExpiryMinutes}m` }
    );

    const baseUrl = getClientBaseUrl(req);
    const qrUrl = `${baseUrl}/attendance/scan?token=${signedQRToken}`;

    session.qrToken = signedQRToken;
    session.qrUrl = qrUrl;
    await session.save();

    const populated = await AttendanceSession.findById(session._id)
      .populate('team', 'name')
      .populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      session: {
        ...populated.toObject(),
        qrUrl
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all active (non-deleted) attendance sessions
// @route   GET /api/attendance/sessions
// @access  Private
const getSessions = async (req, res, next) => {
  try {
    const { team, isActive, search } = req.query;
    let query = { isDeleted: false };

    if (team) query.team = team;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search) query.meetingTitle = { $regex: search, $options: 'i' };

    const sessions = await AttendanceSession.find(query)
      .populate('team', 'name')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    const baseUrl = getClientBaseUrl(req);

    const sessionsWithStats = await Promise.all(
      sessions.map(async (s) => {
        const presentCount = await Attendance.countDocuments({ session: s._id });
        const isExpired = new Date() > new Date(s.qrExpiryTime);
        const qrUrl = `${baseUrl}/attendance/scan?token=${s.qrToken}`;
        return {
          ...s.toObject(),
          presentCount,
          isExpired,
          qrUrl
        };
      })
    );

    res.json({ success: true, sessions: sessionsWithStats });
  } catch (error) {
    next(error);
  }
};

// @desc    Get soft-deleted sessions for Admin Recycle Bin
// @route   GET /api/attendance/sessions/recycle-bin
// @access  Private (Admin/Lead)
const getRecycleBinSessions = async (req, res, next) => {
  try {
    const sessions = await AttendanceSession.find({ isDeleted: true })
      .populate('team', 'name')
      .populate('createdBy', 'name email')
      .sort({ updatedAt: -1 });

    const sessionsWithStats = await Promise.all(
      sessions.map(async (s) => {
        const presentCount = await Attendance.countDocuments({ session: s._id });
        return {
          ...s.toObject(),
          presentCount
        };
      })
    );

    res.json({ success: true, sessions: sessionsWithStats });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify signed JWT QR token & return auto-filled confirmation payload
// @route   GET /api/attendance/verify-qr/:token
// @access  Private
const verifyQRToken = async (req, res, next) => {
  try {
    const token = req.params.token;

    if (!token) {
      return res.status(400).json({ success: false, message: 'QR token is required.' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ success: false, message: 'Invalid or tampered QR Code token.' });
    }

    const { sessionId, expiresAt } = decoded;

    if (Date.now() > expiresAt) {
      return res.status(400).json({ success: false, message: 'Attendance session has expired.' });
    }

    const session = await AttendanceSession.findById(sessionId).populate('team', 'name');

    if (!session || session.isDeleted) {
      return res.status(404).json({ success: false, message: 'Attendance session not found or deleted.' });
    }

    if (!session.isActive) {
      return res.status(400).json({ success: false, message: 'Attendance session has been closed by admin.' });
    }

    if (new Date() > new Date(session.qrExpiryTime)) {
      return res.status(400).json({ success: false, message: 'Attendance session has expired.' });
    }

    // Team restriction check
    if (session.team && req.user.team) {
      const userTeamId = req.user.team._id ? req.user.team._id.toString() : req.user.team.toString();
      if (userTeamId !== session.team._id.toString()) {
        return res.status(403).json({
          success: false,
          message: `This session is restricted to members of ${session.team.name}.`
        });
      }
    }

    const existing = await Attendance.findOne({
      session: session._id,
      member: req.user._id
    });

    if (existing) {
      return res.status(400).json({ 
        success: false, 
        alreadyMarked: true,
        message: 'You have already marked attendance for this session!',
        attendance: existing 
      });
    }

    const fullUser = await User.findById(req.user._id).populate('team position');

    const now = new Date();
    const todayDate = now.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    const serverTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    res.json({
      success: true,
      alreadyMarked: false,
      confirmationData: {
        sessionId: session._id,
        qrToken: token,
        profilePhoto: fullUser.profilePhoto || '',
        memberName: fullUser.name,
        rollNumber: fullUser.rollNumber,
        memberTeam: fullUser.team?.name || 'General',
        memberPosition: fullUser.position?.title || fullUser.role || 'Member',
        date: todayDate,
        checkInTime: serverTime,
        venue: session.venue,
        meetingTitle: session.meetingTitle,
        meetingType: session.meetingType
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit attendance after confirmation popup
// @route   POST /api/attendance/submit
// @access  Private
const submitAttendance = async (req, res, next) => {
  try {
    const { qrToken, sessionId, remarks } = req.body;

    let session;
    if (qrToken) {
      try {
        const decoded = jwt.verify(qrToken, JWT_SECRET);
        session = await AttendanceSession.findById(decoded.sessionId);
      } catch (e) {
        session = await AttendanceSession.findOne({ qrToken });
      }
    } else if (sessionId) {
      session = await AttendanceSession.findById(sessionId);
    }

    if (!session || session.isDeleted) {
      return res.status(404).json({ success: false, message: 'Attendance session not found or has been deleted.' });
    }

    if (!session.isActive) {
      return res.status(400).json({ success: false, message: 'Attendance session has been closed.' });
    }

    if (new Date() > new Date(session.qrExpiryTime)) {
      return res.status(400).json({ success: false, message: 'Attendance session has expired.' });
    }

    const existing = await Attendance.findOne({ session: session._id, member: req.user._id });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already marked attendance for this session!' });
    }

    const fullUser = await User.findById(req.user._id).populate('team position');

    const scanTime = new Date();
    const isLate = scanTime > new Date(session.startTime.getTime() + 15 * 60 * 1000);
    const status = isLate ? 'Late' : 'Present';

    const dateStr = scanTime.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    const timeStr = scanTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const attendance = await Attendance.create({
      session: session._id,
      member: req.user._id,
      memberName: fullUser.name,
      team: fullUser.team?.name || 'General',
      position: fullUser.position?.title || fullUser.role || 'Member',
      meetingTitle: session.meetingTitle,
      meetingType: session.meetingType,
      venue: session.venue,
      date: dateStr,
      checkInTime: timeStr,
      scanTime,
      status,
      remarks: remarks ? remarks.trim() : ''
    });

    const pointsAwarded = status === 'Present' ? 15 : 10;
    await User.findByIdAndUpdate(req.user._id, { $inc: { contributionPoints: pointsAwarded } });

    res.status(201).json({
      success: true,
      message: '✅ Attendance marked successfully.',
      attendance
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'You have already marked attendance for this session!' });
    }
    next(error);
  }
};

// @desc    Get all attendance records with filtering, search & pagination (Admin/Super Admin)
// @route   GET /api/attendance
// @access  Private (Admin/Super Admin)
const getAttendanceRecords = async (req, res, next) => {
  try {
    const {
      nameSearch,
      rollSearch,
      team,
      position,
      session,
      date,
      month,
      year,
      search,
      page = 1,
      limit = 100
    } = req.query;

    let query = {};

    if (search) {
      query.$or = [
        { memberName: { $regex: search, $options: 'i' } },
        { meetingTitle: { $regex: search, $options: 'i' } },
        { venue: { $regex: search, $options: 'i' } }
      ];
    }

    if (nameSearch) {
      query.memberName = { $regex: nameSearch, $options: 'i' };
    }

    if (team) {
      query.team = { $regex: team, $options: 'i' };
    }

    if (position) {
      query.position = { $regex: position, $options: 'i' };
    }

    if (session) {
      query.session = session;
    }

    if (date) {
      query.date = { $regex: date, $options: 'i' };
    }

    const count = await Attendance.countDocuments(query);
    const records = await Attendance.find(query)
      .populate('member', 'name email rollNumber department year team profilePhoto')
      .populate('session', 'meetingTitle meetingType venue isDeleted')
      .sort({ scanTime: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    // Filter out records where roll search is specified if member rollNumber doesn't match
    let finalRecords = records;
    if (rollSearch) {
      finalRecords = records.filter(r => r.member?.rollNumber?.toLowerCase().includes(rollSearch.toLowerCase()));
    }

    res.json({
      success: true,
      count: finalRecords.length,
      totalCount: count,
      page: Number(page),
      pages: Math.ceil(count / limit),
      records: finalRecords
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get attendance records statistics overview
// @route   GET /api/attendance/statistics
// @access  Private (Admin)
const getAttendanceStatistics = async (req, res, next) => {
  try {
    const totalMembers = await User.countDocuments();
    const totalAttendanceRecords = await Attendance.countDocuments();
    const totalSessions = await AttendanceSession.countDocuments({ isDeleted: false });

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const presentToday = await Attendance.countDocuments({ scanTime: { $gte: startOfToday } });

    const totalPossibleAttendance = totalMembers * totalSessions;
    const attendancePercentage = totalPossibleAttendance > 0 
      ? Number(((totalAttendanceRecords / totalPossibleAttendance) * 100).toFixed(1))
      : 0;

    // Aggregate Most Active Team from MongoDB
    const topTeamAggregation = await Attendance.aggregate([
      { $group: { _id: "$team", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]);

    const mostActiveTeam = topTeamAggregation[0] ? topTeamAggregation[0]._id : 'Technical Team';

    res.json({
      success: true,
      statistics: {
        totalMembers,
        presentToday,
        totalAttendanceRecords,
        attendancePercentage,
        mostActiveTeam
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single attendance record details by ID
// @route   GET /api/attendance/:id
// @access  Private (Admin)
const getAttendanceRecordById = async (req, res, next) => {
  try {
    const record = await Attendance.findById(req.params.id)
      .populate('member', 'name email rollNumber department year team position profilePhoto')
      .populate('session', 'meetingTitle meetingType venue startTime endTime');

    if (!record) {
      return res.status(404).json({ success: false, message: 'Attendance record not found.' });
    }

    res.json({ success: true, record });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete attendance record
// @route   DELETE /api/attendance/:id
// @access  Private (Admin / Super Admin)
const deleteAttendanceRecord = async (req, res, next) => {
  try {
    const record = await Attendance.findById(req.params.id);

    if (!record) {
      return res.status(404).json({ success: false, message: 'Attendance record not found in MongoDB.' });
    }

    await record.deleteOne();

    res.json({
      success: true,
      message: 'Attendance record deleted permanently from MongoDB.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get session details
// @route   GET /api/attendance/sessions/:id
// @access  Private (Admin/Lead)
const getSessionDetails = async (req, res, next) => {
  try {
    const session = await AttendanceSession.findById(req.params.id)
      .populate('team', 'name')
      .populate('createdBy', 'name email');

    if (!session || session.isDeleted) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    const attendanceRecords = await Attendance.find({ session: session._id })
      .populate('member', 'name email rollNumber department year team profilePhoto')
      .sort({ scanTime: -1 });

    let totalEligible = 0;
    if (session.team) {
      totalEligible = await User.countDocuments({ team: session.team._id, status: 'active' });
    } else {
      totalEligible = await User.countDocuments({ status: 'active' });
    }

    const presentCount = attendanceRecords.filter(r => r.status === 'Present').length;
    const lateCount = attendanceRecords.filter(r => r.status === 'Late').length;
    const totalAttended = presentCount + lateCount;
    const absentCount = Math.max(0, totalEligible - totalAttended);
    const attendancePercentage = totalEligible > 0 ? ((totalAttended / totalEligible) * 100).toFixed(1) : 100;

    const baseUrl = getClientBaseUrl(req);

    res.json({
      success: true,
      session: {
        ...session.toObject(),
        qrUrl: `${baseUrl}/attendance/scan?token=${session.qrToken}`
      },
      stats: {
        totalEligible,
        presentCount,
        lateCount,
        absentCount,
        totalAttended,
        attendancePercentage
      },
      records: attendanceRecords
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Edit attendance session details
// @route   PUT /api/attendance/sessions/:id
// @access  Private (Admin/Lead)
const updateSession = async (req, res, next) => {
  try {
    const { meetingTitle, meetingType, venue, startTime, endTime, description } = req.body;
    const session = await AttendanceSession.findById(req.params.id);

    if (!session || session.isDeleted) {
      return res.status(404).json({ success: false, message: 'Attendance session not found.' });
    }

    if (meetingTitle) session.meetingTitle = meetingTitle.trim();
    if (meetingType) session.meetingType = meetingType;
    if (venue) session.venue = venue.trim();
    if (startTime) session.startTime = new Date(startTime);
    if (endTime) session.endTime = new Date(endTime);
    if (description !== undefined) session.description = description;

    await session.save();
    res.json({ success: true, message: 'Session updated successfully.', session });
  } catch (error) {
    next(error);
  }
};

// @desc    Soft delete attendance session (Move to Recycle Bin)
// @route   DELETE /api/attendance/sessions/:id
// @access  Private (Admin/Lead)
const deleteSession = async (req, res, next) => {
  try {
    const session = await AttendanceSession.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found in MongoDB.' });
    }

    session.isDeleted = true;
    session.isActive = false;
    await session.save();

    res.json({
      success: true,
      message: 'Attendance Session moved to Recycle Bin.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Restore soft-deleted attendance session from Recycle Bin
// @route   PUT /api/attendance/sessions/:id/restore
// @access  Private (Admin/Lead)
const restoreSession = async (req, res, next) => {
  try {
    const session = await AttendanceSession.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found in MongoDB.' });
    }

    session.isDeleted = false;
    session.isActive = true;
    await session.save();

    res.json({
      success: true,
      message: 'Attendance Session restored successfully.',
      session
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Permanently delete session and linked attendance records from MongoDB
// @route   DELETE /api/attendance/sessions/:id/permanent
// @access  Private (Super Admin / President)
const permanentlyDeleteSession = async (req, res, next) => {
  try {
    const session = await AttendanceSession.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found in MongoDB.' });
    }

    await Attendance.deleteMany({ session: session._id });
    await session.deleteOne();

    res.json({
      success: true,
      message: 'Attendance Session Deleted Successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Close / Toggle session status
// @route   PUT /api/attendance/sessions/:id/toggle
// @access  Private (Admin/Lead)
const toggleSession = async (req, res, next) => {
  try {
    const session = await AttendanceSession.findById(req.params.id);
    if (!session || session.isDeleted) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    session.isActive = !session.isActive;
    await session.save();

    res.json({ success: true, message: `Session status updated to ${session.isActive ? 'Active' : 'Closed'}`, session });
  } catch (error) {
    next(error);
  }
};

// @desc    Get member's personal attendance history
// @route   GET /api/attendance/my-history
// @access  Private (Member)
const getMyAttendance = async (req, res, next) => {
  try {
    const records = await Attendance.find({ member: req.user._id })
      .populate({
        path: 'session',
        populate: { path: 'team', select: 'name' }
      })
      .sort({ createdAt: -1 });

    const validRecords = records.filter(r => r.session && !r.session.isDeleted);

    const totalSessions = await AttendanceSession.countDocuments({ isDeleted: false });
    const myAttended = validRecords.length;
    const percentage = totalSessions > 0 ? ((myAttended / totalSessions) * 100).toFixed(1) : 0;

    res.json({
      success: true,
      stats: {
        totalSessions,
        myAttended,
        percentage
      },
      records: validRecords
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSession,
  getSessions,
  getRecycleBinSessions,
  verifyQRToken,
  submitAttendance,
  getAttendanceRecords,
  getAttendanceStatistics,
  getAttendanceRecordById,
  deleteAttendanceRecord,
  getSessionDetails,
  updateSession,
  deleteSession,
  restoreSession,
  permanentlyDeleteSession,
  toggleSession,
  getMyAttendance
};
