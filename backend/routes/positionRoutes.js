const express = require('express');
const router = express.Router();
const { getPositions, createPosition, updatePosition, reorderPositions, deletePosition } = require('../controllers/positionController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const { logActivity } = require('../middleware/activityLogger');

router.get('/', getPositions);

router.post(
  '/',
  protect,
  authorizeRoles('Super Admin', 'President', 'Vice President'),
  logActivity('Create Position', 'Club Positions', req => `Created position ${req.body.positionName || req.body.title}`),
  createPosition
);

router.put(
  '/reorder',
  protect,
  authorizeRoles('Super Admin', 'President', 'Vice President'),
  logActivity('Reorder Positions', 'Club Positions', () => 'Reordered position display order'),
  reorderPositions
);

router.put(
  '/:id',
  protect,
  authorizeRoles('Super Admin', 'President', 'Vice President'),
  logActivity('Update Position', 'Club Positions', req => `Updated position ID ${req.params.id}`),
  updatePosition
);

router.delete(
  '/:id',
  protect,
  authorizeRoles('Super Admin', 'President'),
  logActivity('Delete Position', 'Club Positions', req => `Deleted position ID ${req.params.id}`),
  deletePosition
);

module.exports = router;
