const mongoose = require('mongoose');

const leaveRequestSchema = new mongoose.Schema({
  faculty:  { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' },
  student:  { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  type: { type: String, enum: ['casual', 'sick', 'medical', 'earned', 'maternity', 'other'], default: 'casual' },
  fromDate: { type: Date, required: true },
  toDate:   { type: Date, required: true },
  reason:   { type: String, required: true },
  status:   { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  adminRemark: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('LeaveRequest', leaveRequestSchema);
