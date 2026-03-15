const express = require('express');
const router = express.Router();
const { getCourses, createCourse, updateCourse, deleteCourse, getFacultyWorkload, uploadSyllabus } = require('../controllers/courseController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect);
router.get('/workload', getFacultyWorkload);
router.route('/').get(getCourses).post(authorize('admin', 'superadmin'), createCourse);
router.route('/:id').put(authorize('admin', 'superadmin'), updateCourse).delete(authorize('admin', 'superadmin'), deleteCourse);
router.put('/:id/syllabus', authorize('admin', 'superadmin'), upload.single('syllabus'), uploadSyllabus);

module.exports = router;
