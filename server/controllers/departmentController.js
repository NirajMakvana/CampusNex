const asyncHandler = require('express-async-handler');
const Department = require('../models/Department');
const Faculty = require('../models/Faculty');
const Student = require('../models/Student');
const Course = require('../models/Course');

const getDepartments = asyncHandler(async (req, res) => {
  const depts = await Department.find().populate({
    path: 'hod',
    populate: { path: 'userId', select: 'name email' },
  });

  const ids = depts.map(d => d._id);

  const [studentCounts, facultyCounts, courseCounts] = await Promise.all([
    Student.aggregate([
      { $match: { department: { $in: ids } } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
    ]),
    Faculty.aggregate([
      { $match: { department: { $in: ids } } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
    ]),
    Course.aggregate([
      { $match: { department: { $in: ids } } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
    ]),
  ]);

  const toMap = (arr) => {
    const map = {};
    arr.forEach(x => { map[x._id.toString()] = x.count; });
    return map;
  };
  const sMap = toMap(studentCounts);
  const fMap = toMap(facultyCounts);
  const cMap = toMap(courseCounts);

  const data = depts.map(d => {
    const obj = d.toObject();
    obj.studentCount = sMap[d._id.toString()] || 0;
    obj.facultyCount = fMap[d._id.toString()] || 0;
    obj.courseCount = cMap[d._id.toString()] || 0;
    return obj;
  });

  res.json({ success: true, data });
});

const createDepartment = asyncHandler(async (req, res) => {
  const dept = await Department.create(req.body);
  res.status(201).json({ success: true, data: dept });
});

const updateDepartment = asyncHandler(async (req, res) => {
  const dept = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!dept) { res.status(404); throw new Error('Department not found'); }
  res.json({ success: true, data: dept });
});

const deleteDepartment = asyncHandler(async (req, res) => {
  const dept = await Department.findByIdAndDelete(req.params.id);
  if (!dept) { res.status(404); throw new Error('Department not found'); }
  res.json({ success: true, message: 'Department deleted' });
});

// HOD — get own department full overview
const getMyDepartment = asyncHandler(async (req, res) => {
  const me = await Faculty.findOne({ userId: req.user._id });
  if (!me) { res.status(404); throw new Error('Faculty profile not found'); }
  const dept = await Department.findOne({ hod: me._id }).populate({
    path: 'hod', populate: { path: 'userId', select: 'name email' },
  });
  if (!dept) { res.status(404); throw new Error('You are not assigned as HOD of any department'); }

  const [faculty, students, courses] = await Promise.all([
    Faculty.find({ department: dept._id }).populate('userId', 'name email avatar'),
    Student.find({ department: dept._id }).populate('userId', 'name email avatar'),
    Course.find({ department: dept._id }),
  ]);

  res.json({
    success: true,
    data: { department: dept, faculty, students, courses },
  });
});

module.exports = { getDepartments, createDepartment, updateDepartment, deleteDepartment, getMyDepartment };
