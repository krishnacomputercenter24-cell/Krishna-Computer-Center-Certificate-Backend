const mongoose = require('mongoose');
module.exports = mongoose.model('Admin', new mongoose.Schema({
  name:     { type: String, required: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
}, { timestamps: true }));
