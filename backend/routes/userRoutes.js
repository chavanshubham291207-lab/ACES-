const express = require('express');
const router = express.Router();
const { getUsers, getUserById, createUser, updateUser, toggleUserStatus, deleteUser } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const { logActivity } = require('../middleware/activityLogger');

router.use(protect);

router.route('/')
  .get(getUsers)
  .post(
    authorizeRoles('Super Admin', 'President', 'Vice President', 'Secretary'),
    logActivity('Create Member', 'Member Management', req => `Created member ${req.body.name}`),
    createUser
  );

router.put(
  '/:id/status',
  authorizeRoles('Super Admin', 'President', 'Vice President', 'Secretary'),
  logActivity('Toggle User Status', 'Member Management', req => `Toggled status for member ID ${req.params.id}`),
  toggleUserStatus
);

router.route('/:id')
  .get(getUserById)
  .put(
    authorizeRoles('Super Admin', 'President', 'Vice President', 'Secretary'),
    logActivity('Update Member', 'Member Management', req => `Updated member ID ${req.params.id}`),
    updateUser
  )
  .delete(
    authorizeRoles('Super Admin', 'President'),
    logActivity('Delete Member', 'Member Management', req => `Deleted member ID ${req.params.id}`),
    deleteUser
  );

module.exports = router;
