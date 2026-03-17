const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/websiteController');
const { protect, authorize } = require('../middleware/auth');

// Public route to get settings — accessible at /api/website/public (no auth)
router.get('/public', getSettings);

// Also expose at root for convenience
router.get('/', protect, authorize('admin', 'superadmin'), getSettings);

// Admin route to update settings
router.put('/', protect, authorize('admin', 'superadmin'), updateSettings);

module.exports = router;
