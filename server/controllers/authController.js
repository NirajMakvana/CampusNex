const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');
const logActivity = require('../utils/logActivity');

// @desc  Login user
// @route POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }
  if (!user.isActive) {
    res.status(403);
    throw new Error('Account is deactivated');
  }

  user.lastLogin = new Date();
  await user.save();
  logActivity(user._id, 'Logged in', 'Auth', '', req.ip);

  const token = generateToken(user._id);
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({
    success: true,
    user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, lastLogin: user.lastLogin },
  });
});

// @desc  Register user (Admin only)
// @route POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (role === 'admin' && req.user.role !== 'superadmin') {
    res.status(403);
    throw new Error('Only superadmin can create admin accounts');
  }

  if (await User.findOne({ email })) {
    res.status(400);
    throw new Error('Email already registered');
  }

  const user = await User.create({ name, email, password, role });
  res.status(201).json({
    success: true,
    user: { _id: user._id, name: user.name, email: user.email, role: user.role },
  });
});

// @desc  Get current user
// @route GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user });
});

// @desc  Forgot password — send OTP
// @route POST /api/auth/forgot-password
const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    res.status(404);
    throw new Error('No user with that email');
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  user.resetOtp = otp;
  user.resetOtpExpire = Date.now() + 10 * 60 * 1000; // 10 min
  await user.save();

  await sendEmail({
    to: user.email,
    subject: 'CampusNex — Password Reset OTP',
    html: `<p>Your OTP is <strong>${otp}</strong>. Valid for 10 minutes.</p>`,
  });

  res.json({ success: true, message: 'OTP sent to email' });
});

// @desc  Reset password with OTP
// @route POST /api/auth/reset-password
const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const user = await User.findOne({ email, resetOtp: otp, resetOtpExpire: { $gt: Date.now() } });

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired OTP');
  }

  user.password = newPassword;
  user.resetOtp = undefined;
  user.resetOtpExpire = undefined;
  await user.save();

  res.json({ success: true, message: 'Password reset successful' });
});

// @desc  Logout
// @route POST /api/auth/logout
const logout = asyncHandler(async (req, res) => {
  res.cookie('token', '', { httpOnly: true, expires: new Date(0) });
  res.json({ success: true, message: 'Logged out' });
});

// @desc  Update profile name
// @route PUT /api/auth/profile
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name: req.body.name },
    { new: true }
  ).select('-password');
  res.json({ success: true, user });
});

// @desc  Change password
// @route PUT /api/auth/change-password
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id);

  if (!(await user.matchPassword(currentPassword))) {
    res.status(400);
    throw new Error('Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();
  res.json({ success: true, message: 'Password updated' });
});

// @desc  Update avatar
// @route PUT /api/auth/avatar
const updateAvatar = asyncHandler(async (req, res) => {
  if (!req.file) { res.status(400); throw new Error('No file uploaded'); }
  const uploadToCloudinary = require('../utils/uploadToCloudinary');
  let url;
  try {
    const result = await uploadToCloudinary(req.file.buffer, 'campusnex/avatars');
    url = result.secure_url;
  } catch (err) {
    res.status(502); throw new Error('Image upload failed. Please try again.');
  }
  await User.findByIdAndUpdate(req.user._id, { avatar: url });
  res.json({ success: true, url });
});

// @desc  Get all admins (superadmin only)
// @route GET /api/auth/admins
const getAdmins = asyncHandler(async (req, res) => {
  const admins = await User.find({ role: 'admin' }).select('-password');
  res.json({ success: true, data: admins });
});

// @desc  Delete an admin (superadmin only)
// @route DELETE /api/auth/admins/:id
const deleteAdmin = asyncHandler(async (req, res) => {
  const admin = await User.findById(req.params.id);
  if (!admin || admin.role !== 'admin') {
    res.status(404); throw new Error('Admin not found');
  }
  await admin.deleteOne();
  res.json({ success: true, message: 'Admin deleted' });
});

module.exports = { login, register, getMe, forgotPassword, resetPassword, logout, updateProfile, changePassword, updateAvatar, getAdmins, deleteAdmin };
