const express = require('express');
const router = express.Router();
const { getDepartments, createDepartment, updateDepartment, deleteDepartment, getMyDepartment } = require('../controllers/departmentController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.route('/').get(getDepartments).post(authorize('admin', 'superadmin'), createDepartment);
router.get('/my-department', authorize('faculty'), getMyDepartment);
router.route('/:id').put(authorize('admin', 'superadmin'), updateDepartment).delete(authorize('superadmin'), deleteDepartment);

module.exports = router;
