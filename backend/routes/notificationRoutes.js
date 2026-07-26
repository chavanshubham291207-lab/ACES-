const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead, sendNotification } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.use(protect);
router.get('/', getNotifications);
router.put('/:id/read', markAsRead);
router.post('/', authorizeRoles('Super Admin', 'President', 'Vice President'), sendNotification);

module.exports = router;
