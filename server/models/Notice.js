const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  targetRole: { type: String, enum: ['all', 'student', 'faculty', 'admin'], default: 'all' },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  attachments: [{ type: String }],
  isPinned: { type: Boolean, default: false },
  expiresAt: { type: Date },
  eventDate: { type: Date }, // optional — for calendar view
}, { timestamps: true });

module.exports = mongoose.model('Notice', noticeSchema);
