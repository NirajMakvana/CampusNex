const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true, uppercase: true },
  hod: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' },
  totalSeats: { type: Number, default: 60 },
  description: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Department', departmentSchema);
