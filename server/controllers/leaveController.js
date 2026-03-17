const asyncHandler = require('express-async-handler');
const LeaveRequest = require('../models/LeaveRequest');
const Faculty = require('../models/Faculty');
const Student = require('../models/Student');
const Department = require('../models/Department');

// Faculty or Student applies for leave
const applyLeave = asyncHandler(async (req, res) => {
  if (req.user.role === 'student') {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) { res.status(404); throw new Error('Student profile not found'); }
    const leave = await LeaveRequest.create({ ...req.body, student: student._id });
    return res.status(201).json({ success: true, data: leave });
  }
  const faculty = await Faculty.findOne({ userId: req.user._id });
  if (!faculty) { res.status(404); throw new Error('Faculty profile not found'); }
  const leave = await LeaveRequest.create({ ...req.body, faculty: faculty._id });
  res.status(201).json({ success: true, data: leave });
});

// Get leaves for a specific faculty
const getFacultyLeaves = asyncHandler(async (req, res) => {
  const leaves = await LeaveRequest.find({ faculty: req.params.id }).sort({ createdAt: -1 });
  res.json({ success: true, data: leaves });
});

// Get leaves for a specific student (self only)
const getStudentLeaves = asyncHandler(async (req, res) => {
  // Students can only see their own
  if (req.user.role === 'student') {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) return res.json({ success: true, data: [] });
    const leaves = await LeaveRequest.find({ student: student._id }).sort({ createdAt: -1 });
    return res.json({ success: true, data: leaves });
  }
  const leaves = await LeaveRequest.find({ student: req.params.id }).sort({ createdAt: -1 });
  res.json({ success: true, data: leaves });
});

// Get all leave requests (admin)
const getAllLeaves = asyncHandler(async (req, res) => {
  const leaves = await LeaveRequest.find()
    .populate({ path: 'faculty', populate: { path: 'userId', select: 'name email' } })
    .populate({ path: 'student', populate: { path: 'userId', select: 'name email' } })
    .sort({ createdAt: -1 });
  res.json({ success: true, data: leaves });
});

// Get department leaves (HOD)
const getDeptLeaves = asyncHandler(async (req, res) => {
  const me = await Faculty.findOne({ userId: req.user._id });
  if (!me) { res.status(404); throw new Error('Faculty profile not found'); }
  
  const dept = await Department.findOne({ hod: me._id });
  if (!dept) return res.json({ success: true, data: [] });
  
  const [deptFaculty, deptStudents] = await Promise.all([
    Faculty.find({ department: dept._id }).select('_id'),
    Student.find({ department: dept._id }).select('_id')
  ]);
  
  const facultyIds = deptFaculty.map(f => f._id);
  const studentIds = deptStudents.map(s => s._id);
  
  const leaves = await LeaveRequest.find({
    $or: [
      { faculty: { $in: facultyIds } },
      { student: { $in: studentIds } }
    ]
  })
    .populate({ path: 'faculty', populate: { path: 'userId', select: 'name email' } })
    .populate({ path: 'student', populate: { path: 'userId', select: 'name email' } })
    .sort({ createdAt: -1 });
    
  res.json({ success: true, data: leaves });
});

// Admin OR HOD approves/rejects
const updateLeaveStatus = asyncHandler(async (req, res) => {
  const { status, adminRemark } = req.body;
  if (req.user.role === 'faculty') {
    const me = await Faculty.findOne({ userId: req.user._id });
    const dept = await Department.findOne({ hod: me._id });
    if (!dept) { res.status(403); throw new Error('Not authorized'); }
    
    const leave = await LeaveRequest.findById(req.params.id)
      .populate('faculty')
      .populate('student');
      
    const leaveDeptId = leave?.faculty?.department || leave?.student?.department;
    
    if (!leaveDeptId || leaveDeptId.toString() !== dept._id.toString()) {
      res.status(403); throw new Error('Not authorized for this department');
    }
  }
  const leave = await LeaveRequest.findByIdAndUpdate(
    req.params.id, { status, adminRemark }, { new: true }
  );
  if (!leave) { res.status(404); throw new Error('Leave request not found'); }
  res.json({ success: true, data: leave });
});

module.exports = { applyLeave, getFacultyLeaves, getStudentLeaves, getAllLeaves, getDeptLeaves, updateLeaveStatus };
