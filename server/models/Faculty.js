const mongoose = require('mongoose');

const facultySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  employeeId: { type: String, required: true, unique: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  designation: { type: String, default: 'Assistant Professor' },
  subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  joiningDate: { type: Date },
  salary: { type: Number },
  phone: { type: String },
  address: { type: String },
  documents: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('Faculty', facultySchema);
