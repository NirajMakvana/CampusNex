const express = require('express');
const router = express.Router();
const { getTimetable, saveTimetableDay, deleteTimetableDay, getMyTimetable } = require('../controllers/timetableController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/my', authorize('faculty'), getMyTimetable);
router.route('/').get(getTimetable).post(authorize('admin', 'superadmin'), saveTimetableDay);
router.delete('/:id', authorize('admin', 'superadmin'), deleteTimetableDay);

module.exports = router;
