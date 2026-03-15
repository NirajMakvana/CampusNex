const express = require('express');
const router = express.Router();
const { applyLeave, getFacultyLeaves, getStudentLeaves, getAllLeaves, getDeptLeaves, updateLeaveStatus } = require('../controllers/leaveController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.post('/', authorize('faculty', 'student'), applyLeave);
router.get('/', authorize('admin', 'superadmin'), getAllLeaves);
router.get('/department', authorize('faculty', 'admin', 'superadmin'), getDeptLeaves);
router.get('/faculty/:id', getFacultyLeaves);
router.get('/student/:id', authorize('student', 'admin', 'superadmin'), getStudentLeaves);
router.put('/:id', authorize('admin', 'superadmin', 'faculty'), updateLeaveStatus);

module.exports = router;
