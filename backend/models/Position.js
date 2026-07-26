const mongoose = require('mongoose');

const positionSchema = new mongoose.Schema({
  memberName: { type: String, required: true, trim: true },
  positionName: { type: String, required: true, trim: true },
  photo: { type: String, required: true },
  displayOrder: { type: Number, default: 0 }
}, { timestamps: true });

// Virtual alias for backward compatibility if queried by 'title'
positionSchema.virtual('title').get(function() {
  return this.positionName;
});
positionSchema.set('toJSON', { virtuals: true });
positionSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Position', positionSchema);
