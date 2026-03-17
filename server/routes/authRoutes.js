const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const {
  login, register, getMe, forgotPassword, resetPassword,
  logout, updateProfile, changePassword, updateAvatar, getAdmins, deleteAdmin,
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: { success: false, message: 'Too many password reset attempts. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/login', login);
router.post('/register', protect, authorize('superadmin', 'admin'), register);
router.get('/me', protect, getMe);
router.post('/forgot-password', forgotPasswordLimiter, forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/logout', protect, logout);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.put('/avatar', protect, upload.single('avatar'), updateAvatar);
router.get('/admins', protect, authorize('superadmin'), getAdmins);
router.delete('/admins/:id', protect, authorize('superadmin'), deleteAdmin);

module.exports = router;
