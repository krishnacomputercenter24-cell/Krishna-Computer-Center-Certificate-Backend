const mongoose = require('mongoose');
module.exports = mongoose.model('Certificate', new mongoose.Schema({
  certificateNumber: { type: String, required: true, unique: true },
  student:           { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  course:            { type: mongoose.Schema.Types.ObjectId, ref: 'Course',  required: true },
  issueDate:         { type: Date, default: Date.now },
  completionDate:    { type: Date },
  grade:             { type: String, enum: ['A+','A','B+','B','C','Pass'], default: 'A' },
  percentage:        { type: Number, min: 0, max: 100 },
  remarks:           { type: String, default: '' },
  issuedBy:          { type: String, default: 'Admin' },
  qrCode:            { type: String },
  isRevoked:         { type: Boolean, default: false },
}, { timestamps: true }));
