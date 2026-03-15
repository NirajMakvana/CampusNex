const asyncHandler = require('express-async-handler');
const Course = require('../models/Course');

const getCourses = asyncHandler(async (req, res) => {
  const { department, semester } = req.query;
  const filter = {};
  if (department) filter.department = department;
  if (semester) filter.semester = semester;
  const courses = await Course.find(filter)
    .populate('department', 'name code')
    .populate({ path: 'faculty', populate: { path: 'userId', select: 'name' } });
  res.json({ success: true, data: courses });
});

const createCourse = asyncHandler(async (req, res) => {
  const course = await Course.create(req.body);
  res.status(201).json({ success: true, data: course });
});

const updateCourse = asyncHandler(async (req, res) => {
  const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!course) { res.status(404); throw new Error('Course not found'); }
  res.json({ success: true, data: course });
});

const deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findByIdAndDelete(req.params.id);
  if (!course) { res.status(404); throw new Error('Course not found'); }
  res.json({ success: true, message: 'Course deleted' });
});

// GET /api/courses/workload — courses grouped by faculty
const getFacultyWorkload = asyncHandler(async (req, res) => {
  const courses = await Course.find({ faculty: { $ne: null } })
    .populate({ path: 'faculty', populate: { path: 'userId', select: 'name' } })
    .populate('department', 'name');
  // Group by faculty
  const map = {};
  courses.forEach(c => {
    if (!c.faculty) return;
    const fid = c.faculty._id.toString();
    if (!map[fid]) map[fid] = { faculty: c.faculty, courses: [] };
    map[fid].courses.push({ _id: c._id, name: c.name, code: c.code, semester: c.semester, department: c.department });
  });
  res.json({ success: true, data: Object.values(map) });
});

// PUT /api/courses/:id/syllabus — upload syllabus PDF to Cloudinary
const uploadSyllabus = asyncHandler(async (req, res) => {
  if (!req.file) { res.status(400); throw new Error('No file uploaded'); }
  const uploadToCloudinary = require('../utils/uploadToCloudinary');
  const result = await uploadToCloudinary(req.file.buffer, 'campusnex/syllabus');
  const course = await Course.findByIdAndUpdate(req.params.id, { syllabus: result.secure_url }, { new: true });
  if (!course) { res.status(404); throw new Error('Course not found'); }
  res.json({ success: true, url: result.secure_url, data: course });
});

module.exports = { getCourses, createCourse, updateCourse, deleteCourse, getFacultyWorkload, uploadSyllabus };
