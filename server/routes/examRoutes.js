const express = require('express');
const router = express.Router();
const { getExams, createExam, deleteExam, updateExam, enterResult, enterBulkResults, getStudentResults, getExamResults, generateSeatingPlan } = require('../controllers/examController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.route('/').get(getExams).post(authorize('admin', 'superadmin'), createExam);
router.route('/:id')
  .put(authorize('admin', 'superadmin'), updateExam)
  .delete(authorize('admin', 'superadmin'), deleteExam);
router.get('/:id/seating-plan', authorize('admin', 'superadmin', 'faculty'), generateSeatingPlan);
router.post('/results/bulk', authorize('faculty', 'admin', 'superadmin'), enterBulkResults);
router.post('/results', authorize('faculty', 'admin', 'superadmin'), enterResult);
router.get('/results/student/:id', getStudentResults);
router.get('/results/exam/:examId', authorize('faculty', 'admin', 'superadmin'), getExamResults);

module.exports = router;
