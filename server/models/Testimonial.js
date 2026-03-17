const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
  name: { type: String, required: true },
  course: { type: String, required: true }, // e.g. "BCA 3rd Year"
  text: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5, default: 5 },
  avatar: { type: String }, // Cloudinary URL
  isActive: { type: Boolean, default: true },
  isApproved: { type: Boolean, default: false }, // Admin approval required
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' }, // Optional link to student
  order: { type: Number, default: 0 }, // For custom ordering
}, { timestamps: true });

module.exports = mongoose.model('Testimonial', testimonialSchema);