const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  banner: { type: String, default: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1000&auto=format&fit=crop&q=80' },
  venue: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  description: { type: String, required: true },
  chiefGuest: { type: String, default: 'Industry Experts' },
  category: { type: String, enum: ['Hackathon', 'Workshop', 'Seminar', 'TechFest', 'Cultural'], default: 'Workshop' },
  registeredMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  gallery: [{ type: String }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
