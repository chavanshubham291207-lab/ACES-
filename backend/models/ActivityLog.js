const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  userName: { type: String, default: 'System' },
  action: { type: String, required: true },
  module: { type: String, required: true },
  details: { type: String, default: '' },
  ip: { type: String, default: '127.0.0.1' }
}, { timestamps: true });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
