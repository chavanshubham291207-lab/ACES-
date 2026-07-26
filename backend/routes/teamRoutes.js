const express = require('express');
const router = express.Router();
const { getTeams, createTeam, updateTeam, deleteTeam } = require('../controllers/teamController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const { logActivity } = require('../middleware/activityLogger');

router.get('/', getTeams);

router.post(
  '/',
  protect,
  authorizeRoles('Super Admin', 'President', 'Vice President'),
  logActivity('Create Team', 'Team Management', req => `Created team ${req.body.name}`),
  createTeam
);

router.put(
  '/:id',
  protect,
  authorizeRoles('Super Admin', 'President', 'Vice President'),
  logActivity('Update Team', 'Team Management', req => `Updated team ID ${req.params.id}`),
  updateTeam
);

router.delete(
  '/:id',
  protect,
  authorizeRoles('Super Admin', 'President'),
  logActivity('Delete Team', 'Team Management', req => `Deleted team ID ${req.params.id}`),
  deleteTeam
);

module.exports = router;
