const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  session: { type: mongoose.Schema.Types.ObjectId, ref: 'AttendanceSession', required: true },
  member: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  memberName: { type: String, required: true },
  team: { type: String, default: 'General' },
  position: { type: String, default: 'Member' },
  meetingTitle: { type: String, required: true },
  meetingType: { type: String, default: 'General Body' },
  venue: { type: String, default: 'Campus' },
  date: { type: String, required: true },
  checkInTime: { type: String, required: true },
  scanTime: { type: Date, default: Date.now },
  status: { type: String, enum: ['Present', 'Late', 'Absent'], default: 'Present' },
  remarks: { type: String, default: '' }
}, { timestamps: true });

// Prevent duplicate attendance per session per member
attendanceSchema.index({ session: 1, member: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
