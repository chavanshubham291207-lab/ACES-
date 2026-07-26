const express = require('express');
const router = express.Router();
const { getPublicStats, getDashboardAnalytics, getActivityLogs } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// Public route for Landing Page live stats
router.get('/public-stats', getPublicStats);

// Protected routes
router.use(protect);
router.get('/dashboard', authorizeRoles('Super Admin', 'President', 'Vice President', 'Secretary', 'Treasurer', 'Team Lead'), getDashboardAnalytics);
router.get('/activity-logs', authorizeRoles('Super Admin', 'President', 'Vice President'), getActivityLogs);

module.exports = router;
