const express = require('express');
const router = express.Router();
const { getNotices, createNotice, updateNotice, deleteNotice } = require('../controllers/noticeController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect);
router.route('/').get(getNotices).post(authorize('admin', 'superadmin', 'faculty'), upload.array('attachments', 5), createNotice);
router.route('/:id').put(authorize('admin', 'superadmin'), updateNotice).delete(authorize('admin', 'superadmin'), deleteNotice);

module.exports = router;
