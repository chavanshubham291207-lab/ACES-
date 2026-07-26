const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  phone: { type: String, default: '' },
  rollNumber: { type: String, required: true, unique: true, uppercase: true },
  department: { type: String, default: 'Computer Engineering' },
  year: { type: String, enum: ['FE', 'SE', 'TE', 'BE', 'Alumni'], default: 'TE' },
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', default: null },
  position: { type: mongoose.Schema.Types.ObjectId, ref: 'Position', default: null },
  role: { 
    type: String, 
    enum: ['Super Admin', 'President', 'Vice President', 'Secretary', 'Treasurer', 'Team Lead', 'Faculty Coordinator', 'Member'], 
    default: 'Member' 
  },
  profilePhoto: { type: String, default: '' },
  linkedin: { type: String, default: '' },
  github: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  status: { type: String, enum: ['Active', 'Inactive', 'active', 'inactive'], default: 'Active' },
  contributionPoints: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  resetPasswordToken: String,
  resetPasswordExpire: Date
}, { timestamps: true });

// Virtual fullName getter
userSchema.virtual('fullName').get(function() {
  return this.name;
});
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

// Pre-save middleware to keep isActive and status in sync and normalize email
userSchema.pre('save', function(next) {
  if (this.email) {
    this.email = this.email.trim().toLowerCase();
  }
  if (this.isModified('isActive')) {
    this.status = this.isActive ? 'Active' : 'Inactive';
  } else if (this.isModified('status')) {
    this.isActive = this.status.toLowerCase() === 'active';
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
