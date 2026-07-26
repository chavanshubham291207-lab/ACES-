const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  assignedBy: { type: String, required: true },
  assignedById: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  memberName: { type: String, required: true },
  team: { type: String, default: 'General Member' },
  taskTitle: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
  deadline: { type: Date, required: true },
  attachment: { type: String, default: '' },
  submissionFiles: [{ type: String }],
  submissionNotes: { type: String, default: '' },
  githubLink: { type: String, default: '' },
  liveDemoLink: { type: String, default: '' },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Submitted', 'Approved', 'Rejected', 'Changes Requested'],
    default: 'Pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
