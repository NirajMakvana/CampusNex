const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getPublicStats, getPublicAdmissionSettings, getPublicNotices, getPublicDepartments, getPublicPrograms, getPublicFaculty,
  submitContact, submitApplication, trackApplication, simulatePayment,
  getApplications, getApplication, updateApplicationStatus, getMeritList,
  getSettings, createSettings, updateSettings,
  getContactMessages, markContactRead, getAdminStats,
} = require('../controllers/admissionController');

// ── Public (no auth) ──────────────────────────────────────────────────────────
router.get('/stats', getPublicStats);
router.get('/admission-settings', getPublicAdmissionSettings);
router.get('/notices', getPublicNotices);
router.get('/departments', getPublicDepartments);
router.get('/programs', getPublicPrograms);
router.get('/faculty', getPublicFaculty);
router.post('/contact', submitContact);

// ── Application (public) ──────────────────────────────────────────────────────
router.post('/apply', upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'marksheet12', maxCount: 1 },
  { name: 'marksheet10', maxCount: 1 },
  { name: 'categoryCert', maxCount: 1 },
  { name: 'aadhar', maxCount: 1 },
]), submitApplication);

router.post('/track', trackApplication);
router.post('/payment/simulate', simulatePayment);

// ── Admin routes ──────────────────────────────────────────────────────────────
router.get('/admin-stats', protect, authorize('admin', 'superadmin'), getAdminStats);
router.get('/', protect, authorize('admin', 'superadmin'), getApplications);
router.get('/merit-list', protect, authorize('admin', 'superadmin'), getMeritList);
router.get('/settings', protect, authorize('admin', 'superadmin'), getSettings);
router.post('/settings', protect, authorize('admin', 'superadmin'), createSettings);
router.put('/settings/:id', protect, authorize('admin', 'superadmin'), updateSettings);
router.get('/contacts', protect, authorize('admin', 'superadmin'), getContactMessages);
router.put('/contacts/:id/read', protect, authorize('admin', 'superadmin'), markContactRead);
router.get('/:id', protect, authorize('admin', 'superadmin'), getApplication);
router.put('/:id/status', protect, authorize('admin', 'superadmin'), updateApplicationStatus);

module.exports = router;
