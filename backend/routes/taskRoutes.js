const express = require('express');
const router = express.Router();
const {
  createTask,
  getTasks,
  getMyTasks,
  getTaskById,
  updateTask,
  deleteTask,
  submitTask,
  updateTaskStatus
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const ADMIN_ROLES = ['Super Admin', 'President', 'Vice President', 'Secretary', 'Treasurer', 'Team Lead'];

router.use(protect);

// Static & Special Routes
router.get('/my-tasks', getMyTasks);

// Member Task Submission Route
router.put('/:id/submit', submitTask);

// Admin Routes
router.post('/', authorizeRoles(...ADMIN_ROLES), createTask);
router.get('/', authorizeRoles(...ADMIN_ROLES), getTasks);
router.put('/:id/status', authorizeRoles(...ADMIN_ROLES), updateTaskStatus);

// Parametric Routes
router.get('/:id', getTaskById);
router.put('/:id', authorizeRoles(...ADMIN_ROLES), updateTask);
router.delete('/:id', authorizeRoles(...ADMIN_ROLES), deleteTask);

module.exports = router;
