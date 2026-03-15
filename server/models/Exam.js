const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  type: { type: String, enum: ['mid', 'end', 'internal', 'practical'], required: true },
  date: { type: Date, required: true },
  totalMarks: { type: Number, required: true },
  passingMarks: { type: Number, required: true },
  hall: { type: String },
  duration: { type: Number, default: 180 }, // minutes
  academicYear: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Exam', examSchema);
