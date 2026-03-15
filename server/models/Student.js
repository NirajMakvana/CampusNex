const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  enrollmentNo: { type: String, required: true, unique: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  semester: { type: Number, min: 1, max: 8, default: 1 },
  batch: { type: String, required: true }, // e.g. "2022-26"
  dob: { type: Date },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  phone: { type: String },
  address: { type: String },
  parentName: { type: String },
  parentPhone: { type: String },
  documents: [{ type: String }], // Cloudinary URLs
  hostelId: { type: mongoose.Schema.Types.ObjectId, ref: 'HostelRoom' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
