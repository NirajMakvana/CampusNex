const mongoose = require('mongoose');

const admissionSettingsSchema = new mongoose.Schema({
  academicYear: { type: String, required: true, unique: true },
  isOpen: { type: Boolean, default: false },
  applicationFee: { type: Number, default: 300 },
  lastDateToApply: Date,
  meritListDate: Date,
  confirmationFee: { type: Number, default: 5000 },
  confirmationLastDate: Date,
  programs: [
    {
      name: String,
      seats: Number,
      eligibilityPercent: Number,
      annualFees: Number,
      duration: String,
    },
  ],
  documentsRequired: [String],
}, { timestamps: true });

module.exports = mongoose.model('AdmissionSettings', admissionSettingsSchema);
