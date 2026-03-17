const express = require('express');
const router = express.Router();
const { getActivityLogs } = require('../controllers/activityLogController');
const { protect, authorize } = require('../middleware/auth');

// All routes require superadmin access
router.use(protect);
router.use(authorize('superadmin'));

router.get('/', getActivityLogs);

module.exports = router;