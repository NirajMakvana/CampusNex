const express = require('express');
const router = express.Router();
const {
  getFeeStructures, createFeeStructure, updateFeeStructure, deleteFeeStructure,
  getStudentFees, assignFee, bulkAssignFee, markFeePaid, applyDiscount,
  getDefaulters, getFeeStats,
} = require('../controllers/feeController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.route('/structures')
  .get(getFeeStructures)
  .post(authorize('admin', 'superadmin'), createFeeStructure);
router.route('/structures/:id')
  .put(authorize('admin', 'superadmin'), updateFeeStructure)
  .delete(authorize('admin', 'superadmin'), deleteFeeStructure);

router.get('/stats', authorize('admin', 'superadmin'), getFeeStats);
router.get('/defaulters', authorize('admin', 'superadmin'), getDefaulters);
router.post('/bulk-assign', authorize('admin', 'superadmin'), bulkAssignFee);
router.post('/assign', authorize('admin', 'superadmin'), assignFee);
router.get('/student/me', getStudentFees);                // student fetches own fees
router.get('/student/:id', getStudentFees);
router.put('/:id/pay', markFeePaid);  // Allow students to pay their own fees
router.put('/:id/discount', authorize('admin', 'superadmin'), applyDiscount);

module.exports = router;
