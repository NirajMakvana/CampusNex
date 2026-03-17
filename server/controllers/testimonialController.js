const asyncHandler = require('express-async-handler');
const Testimonial = require('../models/Testimonial');
const uploadToCloudinary = require('../utils/uploadToCloudinary');

// ─── PUBLIC ROUTES ────────────────────────────────────────────────────────────

// GET /api/public/testimonials - Homepage (limited to 3)
const getPublicTestimonials = asyncHandler(async (req, res) => {
  const testimonials = await Testimonial.find({ 
    isActive: true, 
    isApproved: true 
  })
    .sort({ order: -1, createdAt: -1 })
    .limit(3) // Show only 3 on homepage
    .select('name course text rating avatar');
  
  res.json({ success: true, data: testimonials });
});

// GET /api/public/all-testimonials - All testimonials page
const getAllPublicTestimonials = asyncHandler(async (req, res) => {
  const testimonials = await Testimonial.find({ 
    isActive: true, 
    isApproved: true 
  })
    .sort({ order: -1, createdAt: -1 })
    .select('name course text rating avatar createdAt');
  
  res.json({ success: true, data: testimonials });
});

// GET /api/public/departments - Get all departments for form
const getPublicDepartments = asyncHandler(async (req, res) => {
  try {
    const Department = require('../models/Department');
    const departments = await Department.find({})
      .select('name code')
      .sort({ name: 1 });
    
    res.json({ success: true, data: departments });
  } catch (error) {
    console.error('Department fetch error:', error);
    // Fallback departments if model doesn't exist or error occurs
    const fallbackDepartments = [
      { code: 'BCA', name: 'Bachelor of Computer Applications' },
      { code: 'BBA', name: 'Bachelor of Business Administration' },
      { code: 'BSc IT', name: 'Bachelor of Science in Information Technology' },
      { code: 'BSc CS', name: 'Bachelor of Science in Computer Science' },
      { code: 'MCA', name: 'Master of Computer Applications' },
      { code: 'MBA', name: 'Master of Business Administration' }
    ];
    res.json({ success: true, data: fallbackDepartments });
  }
});
// POST /api/public/submit-review - Public review submission
const submitPublicReview = asyncHandler(async (req, res) => {
  const { name, email, course, text, rating } = req.body;
  
  // Validation
  if (!name || !email || !course || !text || !rating) {
    res.status(400);
    throw new Error('All fields are required');
  }

  if (rating < 1 || rating > 5) {
    res.status(400);
    throw new Error('Rating must be between 1 and 5');
  }

  if (text.length > 500) {
    res.status(400);
    throw new Error('Review text cannot exceed 500 characters');
  }

  const testimonial = await Testimonial.create({
    name: name.trim(),
    course: course.trim(),
    text: text.trim(),
    rating: Number(rating),
    isActive: true,
    isApproved: false, // Requires admin approval
    order: 0
  });

  res.status(201).json({ 
    success: true, 
    message: 'Review submitted successfully! It will be published after admin approval.',
    data: { id: testimonial._id }
  });
});

// ─── ADMIN ROUTES ─────────────────────────────────────────────────────────────

// GET /api/testimonials
const getTestimonials = asyncHandler(async (req, res) => {
  const { status = 'all', page = 1, limit = 20 } = req.query;
  const filter = {};
  
  if (status === 'approved') filter.isApproved = true;
  if (status === 'pending') filter.isApproved = false;
  if (status === 'active') filter.isActive = true;
  if (status === 'inactive') filter.isActive = false;

  const total = await Testimonial.countDocuments(filter);
  const testimonials = await Testimonial.find(filter)
    .populate('studentId', 'enrollmentNo userId')
    .populate('studentId.userId', 'name email')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  res.json({ 
    success: true, 
    count: total, 
    pages: Math.ceil(total / limit), 
    data: testimonials 
  });
});

// POST /api/testimonials
const createTestimonial = asyncHandler(async (req, res) => {
  const { name, course, text, rating, studentId, order } = req.body;
  
  let avatar = null;
  if (req.file) {
    const result = await uploadToCloudinary(req.file.buffer, 'campusnex/testimonials');
    avatar = result.secure_url;
  }

  const testimonial = await Testimonial.create({
    name,
    course,
    text,
    rating: Number(rating) || 5,
    avatar,
    studentId: studentId || null,
    order: Number(order) || 0,
    isApproved: true, // Admin created = auto approved
  });

  res.status(201).json({ success: true, data: testimonial });
});

// PUT /api/testimonials/:id
const updateTestimonial = asyncHandler(async (req, res) => {
  const { name, course, text, rating, order, isActive, isApproved } = req.body;
  
  const testimonial = await Testimonial.findById(req.params.id);
  if (!testimonial) {
    res.status(404);
    throw new Error('Testimonial not found');
  }

  // Handle avatar upload
  if (req.file) {
    const result = await uploadToCloudinary(req.file.buffer, 'campusnex/testimonials');
    testimonial.avatar = result.secure_url;
  }

  testimonial.name = name || testimonial.name;
  testimonial.course = course || testimonial.course;
  testimonial.text = text || testimonial.text;
  testimonial.rating = rating ? Number(rating) : testimonial.rating;
  testimonial.order = order !== undefined ? Number(order) : testimonial.order;
  testimonial.isActive = isActive !== undefined ? isActive : testimonial.isActive;
  testimonial.isApproved = isApproved !== undefined ? isApproved : testimonial.isApproved;

  await testimonial.save();
  res.json({ success: true, data: testimonial });
});

// DELETE /api/testimonials/:id
const deleteTestimonial = asyncHandler(async (req, res) => {
  const testimonial = await Testimonial.findById(req.params.id);
  if (!testimonial) {
    res.status(404);
    throw new Error('Testimonial not found');
  }

  await testimonial.deleteOne();
  res.json({ success: true, message: 'Testimonial deleted' });
});

// PUT /api/testimonials/:id/approve
const approveTestimonial = asyncHandler(async (req, res) => {
  const testimonial = await Testimonial.findByIdAndUpdate(
    req.params.id,
    { isApproved: true },
    { new: true }
  );
  
  if (!testimonial) {
    res.status(404);
    throw new Error('Testimonial not found');
  }

  res.json({ success: true, data: testimonial });
});

// PUT /api/testimonials/:id/toggle-status
const toggleTestimonialStatus = asyncHandler(async (req, res) => {
  const testimonial = await Testimonial.findById(req.params.id);
  if (!testimonial) {
    res.status(404);
    throw new Error('Testimonial not found');
  }

  testimonial.isActive = !testimonial.isActive;
  await testimonial.save();

  res.json({ success: true, isActive: testimonial.isActive });
});

module.exports = {
  getPublicTestimonials,
  getAllPublicTestimonials,
  getPublicDepartments,
  submitPublicReview,
  getTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  approveTestimonial,
  toggleTestimonialStatus,
};