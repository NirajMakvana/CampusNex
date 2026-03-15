const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true, uppercase: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  semester: { type: Number, required: true },
  credits: { type: Number, default: 4 },
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' },
  syllabus: { type: String }, // PDF URL
  isElective: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
