const express = require('express');
const router = express.Router();
const { getEvents, createEvent, registerEvent, deleteEvent } = require('../controllers/eventController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const { logActivity } = require('../middleware/activityLogger');

router.get('/', getEvents);

router.post(
  '/',
  protect,
  authorizeRoles('Super Admin', 'President', 'Vice President', 'Secretary', 'Team Lead'),
  logActivity('Create Event', 'Events', req => `Created event ${req.body.title}`),
  createEvent
);

router.post('/:id/register', protect, logActivity('Register Event', 'Events', req => `User registered for event ID ${req.params.id}`), registerEvent);

router.delete(
  '/:id',
  protect,
  authorizeRoles('Super Admin', 'President'),
  logActivity('Delete Event', 'Events', req => `Deleted event ID ${req.params.id}`),
  deleteEvent
);

module.exports = router;
