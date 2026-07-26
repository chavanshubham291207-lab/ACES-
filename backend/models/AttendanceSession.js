const mongoose = require('mongoose');

const attendanceSessionSchema = new mongoose.Schema({
  meetingTitle: { type: String, required: true },
  meetingType: { 
    type: String, 
    enum: ['General Body', 'Team Meeting', 'Workshop', 'Event', 'Executive Session'], 
    default: 'General Body' 
  },
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', default: null },
  venue: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  qrExpiryTime: { type: Date, required: true },
  qrToken: { type: String, required: true, unique: true },
  description: { type: String, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isActive: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('AttendanceSession', attendanceSessionSchema);
