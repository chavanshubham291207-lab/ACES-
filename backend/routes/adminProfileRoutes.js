const express = require('express');
const router = express.Router();
const {
  getAdminProfile,
  updateAdminProfile,
  uploadAdminPhoto
} = require('../controllers/adminProfileController');
const { resetSystemData } = require('../controllers/systemResetController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const ADMIN_ROLES = ['Super Admin', 'President', 'Vice President', 'Secretary', 'Treasurer', 'Team Lead', 'Faculty Coordinator'];

router.use(protect);

router.get('/', authorizeRoles(...ADMIN_ROLES), getAdminProfile);
router.put('/', authorizeRoles(...ADMIN_ROLES), updateAdminProfile);
router.post('/photo', authorizeRoles(...ADMIN_ROLES), uploadAdminPhoto);

// Super Admin Only System Reset Endpoint
router.post('/reset-system', authorizeRoles('Super Admin'), resetSystemData);

module.exports = router;
