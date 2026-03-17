const asyncHandler = require('express-async-handler');
const Student = require('../models/Student');
const User = require('../models/User');
const uploadToCloudinary = require('../utils/uploadToCloudinary');
const logActivity = require('../utils/logActivity');

// @route GET /api/students
const getStudents = asyncHandler(async (req, res) => {
  const { department, semester, batch, page, limit, search } = req.query;
  const filter = {};
  if (department) filter.department = department;
  if (semester) filter.semester = Number(semester);
  if (batch) filter.batch = batch;

  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.min(100, parseInt(limit) || 50);
  const skip = (pageNum - 1) * limitNum;

  if (search) {
    // First find matching users by name, then filter students
    const matchingUsers = await User.find({
      name: { $regex: search, $options: 'i' },
      role: 'student',
    }).select('_id');
    const userIds = matchingUsers.map(u => u._id);

    filter.$or = [
      { userId: { $in: userIds } },
      { enrollmentNo: { $regex: search, $options: 'i' } },
    ];
  }

  const total = await Student.countDocuments(filter);
  const students = await Student.find(filter)
    .populate('userId', 'name email avatar isActive')
    .populate('department', 'name code')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  // Count active/inactive for KPI cards (only when no search/filter applied for performance)
  let activeCount, inactiveCount;
  if (!search && !department && !semester && !batch) {
    [activeCount, inactiveCount] = await Promise.all([
      Student.countDocuments({ isActive: true }),
      Student.countDocuments({ isActive: false }),
    ]);
  }

  res.json({ success: true, count: total, page: pageNum, pages: Math.ceil(total / limitNum), data: students, activeCount, inactiveCount });
});

// @route POST /api/students
const createStudent = asyncHandler(async (req, res) => {
  const { name, email, password, enrollmentNo, department, semester, batch, dob, gender, phone, address, parentName, parentPhone } = req.body;

  if (await User.findOne({ email })) {
    res.status(400); throw new Error('Email already exists');
  }

  const user = await User.create({ name, email, password: password || 'Campus@123', role: 'student' });
  const student = await Student.create({ userId: user._id, enrollmentNo, department, semester, batch, dob, gender, phone, address, parentName, parentPhone });
  logActivity(req.user._id, `Created student ${name}`, 'Students', enrollmentNo);
  res.status(201).json({ success: true, data: student });
});

// @route GET /api/students/:id
const getStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id)
    .populate('userId', 'name email avatar')
    .populate('department', 'name code');
  if (!student) { res.status(404); throw new Error('Student not found'); }
  res.json({ success: true, data: student });
});

// @route PUT /api/students/:id
const updateStudent = asyncHandler(async (req, res) => {
  const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!student) { res.status(404); throw new Error('Student not found'); }

  // Sync name to User if provided
  if (req.body.name) {
    await User.findByIdAndUpdate(student.userId, { name: req.body.name });
  }

  res.json({ success: true, data: student });
});

// @route DELETE /api/students/:id
const deleteStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) { res.status(404); throw new Error('Student not found'); }
  await User.findByIdAndDelete(student.userId);
  await student.deleteOne();
  logActivity(req.user._id, `Deleted student ${student.enrollmentNo}`, 'Students');
  res.json({ success: true, message: 'Student deleted' });
});

// @route POST /api/students/:id/upload-avatar
const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) { res.status(400); throw new Error('No file uploaded'); }

  const student = await Student.findById(req.params.id);
  if (!student) { res.status(404); throw new Error('Student not found'); }

  // Students can only update their own avatar
  if (req.user.role === 'student' && student.userId.toString() !== req.user._id.toString()) {
    res.status(403); throw new Error('Not authorized to update this avatar');
  }

  const result = await uploadToCloudinary(req.file.buffer, 'campusnex/avatars');
  await User.findByIdAndUpdate(student.userId, { avatar: result.secure_url });
  res.json({ success: true, url: result.secure_url });
});

// @route POST /api/students/bulk-import
// Expects JSON array: [{ name, email, enrollmentNo, department (id), semester, batch, gender, phone }]
const bulkImport = asyncHandler(async (req, res) => {
  const rows = req.body.students;
  if (!Array.isArray(rows) || rows.length === 0) {
    res.status(400); throw new Error('No student data provided');
  }

  const results = { created: 0, skipped: 0, errors: [] };

  for (const row of rows) {
    try {
      const { name, email, enrollmentNo, department, semester, batch, gender, phone } = row;
      if (!name || !email || !enrollmentNo) {
        results.errors.push({ email, reason: 'Missing required fields (name/email/enrollmentNo)' });
        results.skipped++;
        continue;
      }
      // Validate department is a valid ObjectId if provided
      if (department && !/^[a-f\d]{24}$/i.test(department)) {
        results.errors.push({ email, reason: `Invalid department ID "${department}" — use the department ObjectId, not name` });
        results.skipped++;
        continue;
      }
      if (await User.findOne({ email })) {
        results.errors.push({ email, reason: 'Email already exists' });
        results.skipped++;
        continue;
      }
      const user = await User.create({ name, email, password: 'Campus@123', role: 'student' });
      await Student.create({ userId: user._id, enrollmentNo, department, semester: semester || 1, batch, gender, phone });
      results.created++;
    } catch (err) {
      results.errors.push({ email: row.email, reason: err.message });
      results.skipped++;
    }
  }

  res.status(201).json({ success: true, ...results });
});

// @route POST /api/students/promote
const promoteStudents = asyncHandler(async (req, res) => {
  const { department, fromSemester, toSemester } = req.body;
  if (!department || !fromSemester || !toSemester) {
    res.status(400); throw new Error('department, fromSemester and toSemester are required');
  }
  if (Number(toSemester) <= Number(fromSemester)) {
    res.status(400); throw new Error('toSemester must be greater than fromSemester');
  }
  if (Number(toSemester) > 8) {
    res.status(400); throw new Error('Cannot promote beyond semester 8');
  }
  const result = await Student.updateMany(
    { department, semester: Number(fromSemester) },
    { $set: { semester: Number(toSemester) } }
  );
  logActivity(req.user._id, `Promoted students from Sem ${fromSemester} to Sem ${toSemester}`, 'Students');
  res.json({ success: true, promoted: result.modifiedCount, fromSemester, toSemester });
});

// @route GET /api/students/me — student fetches own profile
const getMyProfile = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ userId: req.user._id })
    .populate('userId', 'name email avatar')
    .populate('department', 'name code');
  if (!student) { res.status(404); throw new Error('Student profile not found'); }
  res.json({ success: true, data: student });
});

// @route PUT /api/students/:id/toggle-status — activate/deactivate student account
const toggleStudentStatus = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id).populate('userId');
  if (!student) { res.status(404); throw new Error('Student not found'); }
  const User = require('../models/User');
  const user = await User.findById(student.userId._id);
  user.isActive = !user.isActive;
  await user.save();
  res.json({ success: true, isActive: user.isActive });
});

module.exports = { getStudents, createStudent, getStudent, updateStudent, deleteStudent, uploadAvatar, bulkImport, promoteStudents, getMyProfile, toggleStudentStatus };
