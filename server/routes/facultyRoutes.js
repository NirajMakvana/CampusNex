const express = require('express');
const router = express.Router();
const { getFaculty, createFaculty, getFacultyById, updateFaculty, deleteFaculty, toggleFacultyStatus, getMyFacultyProfile } = require('../controllers/facultyController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
// admin/superadmin/faculty can list faculty (needed for timetable display)
router.route('/').get(authorize('admin', 'superadmin', 'faculty', 'student'), getFaculty).post(authorize('admin', 'superadmin'), createFaculty);
router.get('/me', authorize('faculty'), getMyFacultyProfile);
router.put('/:id/toggle-status', authorize('admin', 'superadmin'), toggleFacultyStatus);
router.route('/:id').get(getFacultyById).put(authorize('admin', 'superadmin', 'faculty'), updateFaculty).delete(authorize('admin', 'superadmin'), deleteFaculty);

module.exports = router;
