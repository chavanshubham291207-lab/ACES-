const Task = require('../models/Task');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Assign a new task to a member (Admin/Lead)
// @route   POST /api/tasks
// @access  Private (Admin/Lead)
const createTask = async (req, res, next) => {
  try {
    const {
      assignedTo,
      taskTitle,
      description,
      priority = 'Medium',
      deadline,
      attachment
    } = req.body;

    if (!assignedTo || !taskTitle || !deadline) {
      return res.status(400).json({ success: false, message: 'Assigned member, task title, and deadline are required.' });
    }

    const member = await User.findById(assignedTo).populate('team');
    if (!member) {
      return res.status(404).json({ success: false, message: 'Target member profile not found.' });
    }

    const task = await Task.create({
      assignedBy: req.user.name || req.user.fullName || 'Admin',
      assignedById: req.user._id,
      assignedTo: member._id,
      memberName: member.name,
      team: member.team?.name || 'General Member',
      taskTitle: taskTitle.trim(),
      description: description ? description.trim() : '',
      priority,
      deadline: new Date(deadline),
      attachment: attachment || '',
      status: 'Pending'
    });

    // Send Notification to Member
    await Notification.create({
      recipient: member._id,
      title: `📌 New Task Assigned: ${task.taskTitle}`,
      message: `You have been assigned a new task "${task.taskTitle}" by ${task.assignedBy}. Deadline: ${new Date(deadline).toLocaleDateString()}.`,
      type: 'task'
    });

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email rollNumber profilePhoto team position')
      .populate('assignedById', 'name email role position');

    res.status(201).json({
      success: true,
      message: 'Task assigned successfully to member.',
      task: populatedTask
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all tasks with filters & search (Admin/Lead)
// @route   GET /api/tasks
// @access  Private (Admin/Lead)
const getTasks = async (req, res, next) => {
  try {
    const { status, team, priority, search } = req.query;
    let query = {};

    if (status) query.status = status;
    if (team) query.team = { $regex: team, $options: 'i' };
    if (priority) query.priority = priority;
    if (search) {
      query.$or = [
        { taskTitle: { $regex: search, $options: 'i' } },
        { memberName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email rollNumber profilePhoto team position')
      .populate('assignedById', 'name email role position')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: tasks.length,
      tasks
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get tasks assigned to logged-in member
// @route   GET /api/tasks/my-tasks
// @access  Private (Member)
const getMyTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user._id })
      .populate('assignedById', 'name email role position')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: tasks.length,
      tasks
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single task details
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email rollNumber profilePhoto team position')
      .populate('assignedById', 'name email role position');

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found in MongoDB.' });
    }

    res.json({ success: true, task });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task details (Admin)
// @route   PUT /api/tasks/:id
// @access  Private (Admin/Lead)
const updateTask = async (req, res, next) => {
  try {
    const { taskTitle, description, priority, deadline, attachment } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    if (taskTitle) task.taskTitle = taskTitle.trim();
    if (description !== undefined) task.description = description;
    if (priority) task.priority = priority;
    if (deadline) task.deadline = new Date(deadline);
    if (attachment !== undefined) task.attachment = attachment;

    await task.save();

    const updated = await Task.findById(task._id)
      .populate('assignedTo', 'name email rollNumber profilePhoto team position')
      .populate('assignedById', 'name email role position');

    res.json({ success: true, message: 'Task updated successfully.', task: updated });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete task (Admin)
// @route   DELETE /api/tasks/:id
// @access  Private (Admin/Lead)
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found in MongoDB.' });
    }

    await task.deleteOne();

    res.json({ success: true, message: 'Task deleted successfully from MongoDB.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit task (Member)
// @route   PUT /api/tasks/:id/submit
// @access  Private (Member)
const submitTask = async (req, res, next) => {
  try {
    const { submissionFiles, submissionNotes, githubLink, liveDemoLink } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    if (task.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You can only submit tasks assigned to you.' });
    }

    if (submissionFiles && Array.isArray(submissionFiles)) {
      task.submissionFiles = submissionFiles;
    }
    if (submissionNotes !== undefined) task.submissionNotes = submissionNotes;
    if (githubLink !== undefined) task.githubLink = githubLink.trim();
    if (liveDemoLink !== undefined) task.liveDemoLink = liveDemoLink.trim();

    task.status = 'Submitted';
    await task.save();

    // Send Notification to Admin Assigner
    await Notification.create({
      recipient: task.assignedById,
      title: `📥 Task Submitted: ${task.taskTitle}`,
      message: `${req.user.name} submitted work for task "${task.taskTitle}". Ready for approval review.`,
      type: 'task'
    });

    const updated = await Task.findById(task._id)
      .populate('assignedTo', 'name email rollNumber profilePhoto team position')
      .populate('assignedById', 'name email role position');

    res.json({
      success: true,
      message: 'Task work submitted successfully for approval.',
      task: updated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task status (Approve, Reject, Request Changes, In Progress) (Admin)
// @route   PUT /api/tasks/:id/status
// @access  Private (Admin/Lead)
const updateTaskStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Pending', 'In Progress', 'Submitted', 'Approved', 'Rejected', 'Changes Requested'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Valid status value is required.' });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    task.status = status;
    await task.save();

    // Award contribution points if approved
    if (status === 'Approved') {
      const points = task.priority === 'High' ? 30 : task.priority === 'Medium' ? 20 : 10;
      await User.findByIdAndUpdate(task.assignedTo, { $inc: { contributionPoints: points } });
    }

    // Send Notification to Member
    await Notification.create({
      recipient: task.assignedTo,
      title: `Task Status Updated: ${task.taskTitle}`,
      message: `Your task "${task.taskTitle}" status has been changed to "${status}".`,
      type: 'task'
    });

    const updated = await Task.findById(task._id)
      .populate('assignedTo', 'name email rollNumber profilePhoto team position')
      .populate('assignedById', 'name email role position');

    res.json({
      success: true,
      message: `Task status updated to ${status}.`,
      task: updated
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTask,
  getTasks,
  getMyTasks,
  getTaskById,
  updateTask,
  deleteTask,
  submitTask,
  updateTaskStatus
};
