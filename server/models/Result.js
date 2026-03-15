const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  marksObtained: { type: Number, required: true },
  grade: { type: String }, // A+, A, B, C, D, F
  status: { type: String, enum: ['pass', 'fail', 'absent'], required: true },
  sgpa: { type: Number },
  cgpa: { type: Number },
  remarks: { type: String },
}, { timestamps: true });

resultSchema.index({ student: 1, exam: 1 }, { unique: true });

module.exports = mongoose.model('Result', resultSchema);
