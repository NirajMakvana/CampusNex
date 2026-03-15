const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  time: { type: String, required: true }, // e.g. "09:00-10:00"
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' },
  room: { type: String },
}, { _id: false });

const timetableSchema = new mongoose.Schema({
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  semester: { type: Number, required: true },
  day: { type: String, enum: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'], required: true },
  slots: [slotSchema],
  academicYear: { type: String, required: true },
}, { timestamps: true });

timetableSchema.index({ department: 1, semester: 1, day: 1, academicYear: 1 }, { unique: true });

module.exports = mongoose.model('Timetable', timetableSchema);
