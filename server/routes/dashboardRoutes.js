const express = require('express');
const router = express.Router();
const { getAdminStats, getStudentStats, getFeeCollectionTrend } = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/stats', authorize('admin', 'superadmin'), getAdminStats);
router.get('/stats/student', authorize('student'), getStudentStats);
router.get('/fee-trend', authorize('admin', 'superadmin'), getFeeCollectionTrend);

module.exports = router;
