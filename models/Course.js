const mongoose = require('mongoose');
module.exports = mongoose.model('Course', new mongoose.Schema({
  name:        { type: String, required: true, unique: true, trim: true },
  code:        { type: String, required: true, unique: true, uppercase: true },
  duration:    { type: String, required: true },
  description: { type: String, default: '' },
  isActive:    { type: Boolean, default: true },
}, { timestamps: true }));
