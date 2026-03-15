const express = require('express');
const router = express.Router();
const {
  login, register, getMe, forgotPassword, resetPassword,
  logout, updateProfile, changePassword, updateAvatar, getAdmins, deleteAdmin,
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/login', login);
router.post('/register', protect, authorize('superadmin', 'admin'), register);
router.get('/me', protect, getMe);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/logout', protect, logout);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.put('/avatar', protect, upload.single('avatar'), updateAvatar);
router.get('/admins', protect, authorize('superadmin'), getAdmins);
router.delete('/admins/:id', protect, authorize('superadmin'), deleteAdmin);

module.exports = router;
