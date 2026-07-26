const Notification = require('../models/Notification');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({
      $or: [
        { recipient: req.user._id },
        { recipient: null }
      ]
    }).sort({ createdAt: -1 }).limit(20);

    const unreadCount = notifications.filter(n => !n.readBy.includes(req.user._id)).length;

    res.json({ success: true, unreadCount, notifications });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    if (!notification.readBy.includes(req.user._id)) {
      notification.readBy.push(req.user._id);
      await notification.save();
    }

    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    next(error);
  }
};

// @desc    Create broadcast or target notification
// @route   POST /api/notifications
// @access  Private (Admin)
const sendNotification = async (req, res, next) => {
  try {
    const { recipient, title, message, type } = req.body;

    const notification = await Notification.create({
      recipient: recipient || null,
      title,
      message,
      type: type || 'general'
    });

    res.status(201).json({ success: true, notification });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  sendNotification
};
