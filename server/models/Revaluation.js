const mongoose = require('mongoose');

const revaluationSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  result: { type: mongoose.Schema.Types.ObjectId, ref: 'Result', required: true },
  exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['pending', 'under_review', 'approved', 'rejected'], default: 'pending' },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewNote: { type: String },
  updatedMarks: { type: Number },
}, { timestamps: true });

module.exports = mongoose.model('Revaluation', revaluationSchema);
