const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const { logActivity } = require('../middleware/activityLogger');

router.use(protect);

const ADMIN_ROLES = ['Super Admin', 'President', 'Vice President', 'Secretary', 'Treasurer', 'Team Lead'];

// 1. Attendance Records APIs
router.get('/statistics', authorizeRoles(...ADMIN_ROLES), getAttendanceStatistics);
router.get('/', authorizeRoles(...ADMIN_ROLES), getAttendanceRecords);

// 2. Session Creation
router.post(
  '/sessions',
  authorizeRoles(...ADMIN_ROLES),
  logActivity('Create Session', 'Attendance', req => `Created attendance session ${req.body.meetingTitle}`),
  createSession
);

// 3. Static Session Listing & Utility Routes
router.get('/sessions', getSessions);
router.get('/sessions/recycle-bin', authorizeRoles(...ADMIN_ROLES), getRecycleBinSessions);
router.get('/verify-qr/:token', verifyQRToken);
router.post('/submit', logActivity('Submit Attendance', 'Attendance', req => `Attendance submitted for session token ${req.body.qrToken}`), submitAttendance);
router.get('/my-history', getMyAttendance);

// 4. Sub-Action Routes
router.put('/sessions/:id/toggle', authorizeRoles(...ADMIN_ROLES), toggleSession);
router.put('/sessions/:id/restore', authorizeRoles(...ADMIN_ROLES), restoreSession);
router.delete('/sessions/:id/permanent', authorizeRoles(...ADMIN_ROLES), permanentlyDeleteSession);

// 5. Session Detail & Session Management Parametric Routes
router.get('/sessions/:id', getSessionDetails);
router.put('/sessions/:id', authorizeRoles(...ADMIN_ROLES), updateSession);
router.delete('/sessions/:id', authorizeRoles(...ADMIN_ROLES), deleteSession);

// 6. Single Record Parametric Routes
router.get('/:id', authorizeRoles(...ADMIN_ROLES), getAttendanceRecordById);
router.delete(
  '/:id',
  authorizeRoles(...ADMIN_ROLES),
  logActivity('Delete Attendance Record', 'Attendance', req => `Deleted attendance record ${req.params.id}`),
  deleteAttendanceRecord
);

module.exports = router;
