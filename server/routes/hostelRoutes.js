const express = require('express');
const router = express.Router();
const { getRooms, createRoom, allocateRoom, removeOccupant, transferOccupant, getMyMaintenanceRequests, getMaintenanceRequests, createMaintenanceRequest, updateMaintenanceStatus, getActiveMenu, getAllMenus, createMenu, updateMenu } = require('../controllers/hostelController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.route('/rooms').get(getRooms).post(authorize('admin', 'superadmin'), createRoom);
router.post('/rooms/:id/allocate',  authorize('admin', 'superadmin'), allocateRoom);
router.post('/rooms/:id/remove',    authorize('admin', 'superadmin'), removeOccupant);
router.post('/rooms/:id/transfer',  authorize('admin', 'superadmin'), transferOccupant);
router.route('/maintenance').get(authorize('admin', 'superadmin'), getMaintenanceRequests).post(createMaintenanceRequest);
router.get('/maintenance/my', getMyMaintenanceRequests);
router.put('/maintenance/:id', authorize('admin', 'superadmin'), updateMaintenanceStatus);
router.get('/mess/active', getActiveMenu);
router.get('/mess', authorize('admin', 'superadmin'), getAllMenus);
router.post('/mess', authorize('admin', 'superadmin'), createMenu);
router.put('/mess/:id', authorize('admin', 'superadmin'), updateMenu);

module.exports = router;
