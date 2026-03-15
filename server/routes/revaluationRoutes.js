const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const Revaluation = require('../models/Revaluation');
const Result = require('../models/Result');
const Exam = require('../models/Exam');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// Student: submit revaluation request
router.post('/', asyncHandler(async (req, res) => {
  const { resultId, reason } = req.body;
  const result = await Result.findById(resultId).populate('exam');
  if (!result) { res.status(404); throw new Error('Result not found'); }

  const existing = await Revaluation.findOne({ result: resultId, status: { $in: ['pending', 'under_review'] } });
  if (existing) { res.status(400); throw new Error('Revaluation already requested for this result'); }

  const rev = await Revaluation.create({
    student: result.student,
    result: resultId,
    exam: result.exam._id,
    reason,
  });
  res.status(201).json({ success: true, data: rev });
}));

// Student: get own requests
router.get('/my/:studentId', asyncHandler(async (req, res) => {
  const requests = await Revaluation.find({ student: req.params.studentId })
    .populate({ path: 'exam', populate: { path: 'course', select: 'name code' } })
    .populate('result', 'marksObtained grade')
    .sort({ createdAt: -1 });
  res.json({ success: true, data: requests });
}));

// Admin/Faculty: get all requests
router.get('/', authorize('admin', 'superadmin', 'faculty'), asyncHandler(async (req, res) => {
  const requests = await Revaluation.find()
    .populate({ path: 'student', populate: { path: 'userId', select: 'name' } })
    .populate({ path: 'exam', populate: { path: 'course', select: 'name code' } })
    .populate('result', 'marksObtained grade')
    .sort({ createdAt: -1 });
  res.json({ success: true, data: requests });
}));

// Admin/Faculty: review a request
router.put('/:id', authorize('admin', 'superadmin', 'faculty'), asyncHandler(async (req, res) => {
  const { status, reviewNote, updatedMarks } = req.body;
  const rev = await Revaluation.findByIdAndUpdate(
    req.params.id,
    { status, reviewNote, updatedMarks, reviewedBy: req.user._id },
    { new: true }
  );
  if (!rev) { res.status(404); throw new Error('Request not found'); }

  // If approved and updatedMarks provided, update the result
  if (status === 'approved' && updatedMarks !== undefined) {
    const exam = await Exam.findById(rev.exam);
    const pct = (updatedMarks / exam.totalMarks) * 100;
    const grade = pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 70 ? 'B+' : pct >= 60 ? 'B' : pct >= 50 ? 'C' : pct >= 40 ? 'D' : 'F';
    const resultStatus = updatedMarks >= exam.passingMarks ? 'pass' : 'fail';
    await Result.findByIdAndUpdate(rev.result, { marksObtained: updatedMarks, grade, status: resultStatus });
  }

  res.json({ success: true, data: rev });
}));

module.exports = router;
