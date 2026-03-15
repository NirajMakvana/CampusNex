const mongoose = require('mongoose');

const feeStructureSchema = new mongoose.Schema({
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  semester: { type: Number },
  amount: { type: Number, required: true },
  academicYear: { type: String, required: true },
  description: { type: String },
}, { timestamps: true });

const feeSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  feeStructure: { type: mongoose.Schema.Types.ObjectId, ref: 'FeeStructure' },
  amount: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  dueDate: { type: Date },
  paidDate: { type: Date },
  status: { type: String, enum: ['paid', 'pending', 'overdue'], default: 'pending' },
  transactionId: { type: String },
  paymentMethod: { type: String },
}, { timestamps: true });

const FeeStructure = mongoose.model('FeeStructure', feeStructureSchema);
const Fee = mongoose.model('Fee', feeSchema);

module.exports = { Fee, FeeStructure };
