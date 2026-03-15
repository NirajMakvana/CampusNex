const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const ActivityLog = require('../models/ActivityLog');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// GET /api/activity/me — current user's own logs
router.get('/me', asyncHandler(async (req, res) => {
  const logs = await ActivityLog.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50);
  res.json({ success: true, data: logs });
}));

// GET /api/activity — all logs (admin only)
router.get('/', authorize('admin', 'superadmin'), asyncHandler(async (req, res) => {
  const logs = await ActivityLog.find()
    .populate('user', 'name role')
    .sort({ createdAt: -1 })
    .limit(100);
  res.json({ success: true, data: logs });
}));

module.exports = router;
