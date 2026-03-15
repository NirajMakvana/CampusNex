const asyncHandler = require('express-async-handler');
const Faculty = require('../models/Faculty');
const User = require('../models/User');

// @route GET /api/faculty
const getFaculty = asyncHandler(async (req, res) => {
  const { department, page, limit } = req.query;
  const filter = department ? { department } : {};

  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.min(100, parseInt(limit) || 50);
  const skip = (pageNum - 1) * limitNum;

  const total = await Faculty.countDocuments(filter);
  const faculty = await Faculty.find(filter)
    .populate('userId', 'name email avatar')
    .populate('department', 'name code')
    .populate('subjects', 'name code')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  res.json({ success: true, count: total, page: pageNum, pages: Math.ceil(total / limitNum), data: faculty });
});

// @route POST /api/faculty
const createFaculty = asyncHandler(async (req, res) => {
  const { name, email, password, employeeId, department, designation, joiningDate, salary, phone } = req.body;

  if (await User.findOne({ email })) {
    res.status(400); throw new Error('Email already exists');
  }

  const user = await User.create({ name, email, password: password || 'Faculty@123', role: 'faculty' });
  const faculty = await Faculty.create({ userId: user._id, employeeId, department, designation, joiningDate, salary, phone });

  res.status(201).json({ success: true, data: faculty });
});

// @route GET /api/faculty/:id
const getFacultyById = asyncHandler(async (req, res) => {
  const faculty = await Faculty.findById(req.params.id)
    .populate('userId', 'name email avatar')
    .populate('department', 'name code')
    .populate('subjects', 'name code semester');
  if (!faculty) { res.status(404); throw new Error('Faculty not found'); }
  res.json({ success: true, data: faculty });
});

// @route PUT /api/faculty/:id
const updateFaculty = asyncHandler(async (req, res) => {
  const faculty = await Faculty.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!faculty) { res.status(404); throw new Error('Faculty not found'); }
  res.json({ success: true, data: faculty });
});

// @route DELETE /api/faculty/:id
const deleteFaculty = asyncHandler(async (req, res) => {
  const faculty = await Faculty.findById(req.params.id);
  if (!faculty) { res.status(404); throw new Error('Faculty not found'); }
  await User.findByIdAndDelete(faculty.userId);
  await faculty.deleteOne();
  res.json({ success: true, message: 'Faculty deleted' });
});

// @route PUT /api/faculty/:id/toggle-status
const toggleFacultyStatus = asyncHandler(async (req, res) => {
  const faculty = await Faculty.findById(req.params.id).populate('userId');
  if (!faculty) { res.status(404); throw new Error('Faculty not found'); }
  const user = await User.findById(faculty.userId);
  if (!user) { res.status(404); throw new Error('User not found'); }
  user.isActive = !user.isActive;
  await user.save();
  res.json({ success: true, isActive: user.isActive });
});

// @route GET /api/faculty/me
const getMyFacultyProfile = asyncHandler(async (req, res) => {
  const faculty = await Faculty.findOne({ userId: req.user._id })
    .populate('userId', 'name email avatar')
    .populate('department', 'name code');
  if (!faculty) { res.status(404); throw new Error('Faculty profile not found'); }
  res.json({ success: true, data: faculty });
});

module.exports = { getFaculty, createFaculty, getFacultyById, updateFaculty, deleteFaculty, toggleFacultyStatus, getMyFacultyProfile };
