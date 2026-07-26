const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // Null for broadcast
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['meeting', 'attendance', 'event', 'task', 'general'], default: 'general' },
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
