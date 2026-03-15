const express = require('express');
const router = express.Router();
const {
  markAttendance,
  getAttendanceByDate,
  getStudentAttendance,
  getMonthlyReport,
  getCourseAttendanceReport,
  correctAttendance,
  getAttendanceStats,
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/stats', authorize('admin', 'superadmin'), getAttendanceStats);
router.post('/mark', authorize('faculty', 'admin', 'superadmin'), markAttendance);
router.get('/student/:studentId/monthly', getMonthlyReport);
router.get('/student/:id', getStudentAttendance);
router.get('/course/:courseId/report', authorize('faculty', 'admin', 'superadmin'), getCourseAttendanceReport);
router.get('/:courseId/:date', authorize('faculty', 'admin', 'superadmin'), getAttendanceByDate);
router.put('/:id', authorize('admin', 'superadmin'), correctAttendance);

module.exports = router;
