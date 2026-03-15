const express = require('express');
const router = express.Router();
const { getStudents, createStudent, getStudent, updateStudent, deleteStudent, uploadAvatar, bulkImport, promoteStudents, getMyProfile, toggleStudentStatus } = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect);
router.route('/').get(authorize('admin', 'superadmin', 'faculty'), getStudents).post(authorize('admin', 'superadmin'), createStudent);
router.get('/me', getMyProfile);                                          // student own profile
router.post('/bulk-import', authorize('admin', 'superadmin'), bulkImport);
router.post('/promote', authorize('admin', 'superadmin'), promoteStudents);
router.route('/:id').get(getStudent).put(authorize('admin', 'superadmin'), updateStudent).delete(authorize('admin', 'superadmin'), deleteStudent);
router.put('/:id/toggle-status', authorize('admin', 'superadmin'), toggleStudentStatus);
router.post('/:id/avatar', upload.single('avatar'), uploadAvatar);

module.exports = router;
