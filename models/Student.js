const mongoose = require('mongoose');
module.exports = mongoose.model('Student', new mongoose.Schema({
  studentId:      { type: String, required: true, unique: true, uppercase: true, trim: true },
  name:           { type: String, required: true, trim: true },
  fatherName:     { type: String, trim: true, default: '' },
  email:          { type: String, trim: true, default: '' },
  phone:          { type: String, trim: true, default: '' },
  address:        { type: String, trim: true, default: '' },
  dateOfBirth:    { type: Date },
  enrollmentDate: { type: Date, default: Date.now },
}, { timestamps: true }));
