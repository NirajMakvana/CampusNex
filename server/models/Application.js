const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  applicationId: { type: String, unique: true },

  personalInfo: {
    name: { type: String, required: true },
    dob: { type: Date, required: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    mobile: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    address: {
      street: String,
      city: String,
      state: String,
      pin: String,
    },
    category: { type: String, enum: ['General', 'OBC', 'SC', 'ST', 'EWS'], default: 'General' },
    nationality: { type: String, default: 'Indian' },
    religion: String,
  },

  academicInfo: {
    board: String,
    school: String,
    passingYear: Number,
    percentage: { type: Number, required: true },
    stream: { type: String, enum: ['Science', 'Commerce', 'Arts', 'Other'] },
    subjects: String,
    tenth: {
      board: String,
      school: String,
      passingYear: Number,
      percentage: Number,
    },
  },

  coursePreference: [
    {
      rank: Number,
      program: String,
    },
  ],

  documents: {
    photo: String,
    marksheet12: String,
    marksheet10: String,
    categoryCert: String,
    aadhar: String,
  },

  status: {
    type: String,
    enum: ['applied', 'under-review', 'shortlisted', 'fee-pending', 'confirmed', 'rejected'],
    default: 'applied',
  },

  applicationFee: {
    amount: { type: Number, default: 0 },
    status: { type: String, enum: ['pending', 'paid'], default: 'pending' },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    paidAt: Date,
  },

  confirmationFee: {
    amount: { type: Number, default: 0 },
    status: { type: String, enum: ['pending', 'paid'], default: 'pending' },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    paidAt: Date,
  },

  allocatedProgram: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  adminRemarks: String,
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  studentCreated: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  academicYear: { type: String, default: '2025-26' },
  statusUpdatedAt: Date,
  statusHistory: [{
    status: { type: String },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    remark: String,
    changedAt: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

// Atomic counter schema to avoid race conditions on applicationId generation
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});
const Counter = mongoose.model('Counter', counterSchema);

// Auto-generate applicationId before save using atomic increment
applicationSchema.pre('save', async function (next) {
  if (!this.applicationId) {
    const year = new Date().getFullYear();
    const counter = await Counter.findByIdAndUpdate(
      `application_${year}`,
      { $inc: { seq: 1 } },
      { upsert: true, new: true }
    );
    this.applicationId = `CX-${year}-${String(counter.seq).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Application', applicationSchema);
