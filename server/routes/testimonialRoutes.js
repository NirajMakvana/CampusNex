const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
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
} = require('../controllers/testimonialController');

// ── Public routes (no auth required) ──────────────────────────────────────
router.get('/public', getPublicTestimonials); // Homepage - 3 reviews
router.get('/public/all-testimonials', getAllPublicTestimonials); // All reviews page
router.get('/public/departments', getPublicDepartments); // Departments for form
router.post('/public/submit-review', submitPublicReview); // Public submission

// ── Admin routes (auth required) ───────────────────────────────────────────
router.get('/', protect, authorize('admin', 'superadmin'), getTestimonials);
router.post('/', protect, authorize('admin', 'superadmin'), upload.single('avatar'), createTestimonial);
router.put('/:id', protect, authorize('admin', 'superadmin'), upload.single('avatar'), updateTestimonial);
router.delete('/:id', protect, authorize('admin', 'superadmin'), deleteTestimonial);
router.put('/:id/approve', protect, authorize('admin', 'superadmin'), approveTestimonial);
router.put('/:id/toggle-status', protect, authorize('admin', 'superadmin'), toggleTestimonialStatus);

module.exports = router;