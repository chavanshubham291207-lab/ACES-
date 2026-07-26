const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  level: { type: Number, required: true },
  permissions: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('Role', roleSchema);
