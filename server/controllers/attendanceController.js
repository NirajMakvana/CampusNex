const asyncHandler = require('express-async-handler');
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const Course = require('../models/Course');

// @route POST /api/attendance/mark  — bulk mark for a class
const markAttendance = asyncHandler(async (req, res) => {
  const { courseId, date, records } = req.body;
  // records: [{ studentId, status, remarks }]
  const ops = records.map(r => ({
    updateOne: {
      filter: { student: r.studentId, course: courseId, date: new Date(date) },
      update: { $set: { status: r.status, remarks: r.remarks || '' } },
      upsert: true,
    },
  }));
  await Attendance.bulkWrite(ops);
  res.json({ success: true, message: 'Attendance marked' });
});

// @route GET /api/attendance/:courseId/:date
const getAttendanceByDate = asyncHandler(async (req, res) => {
  const { courseId, date } = req.params;
  const records = await Attendance.find({ course: courseId, date: new Date(date) })
    .populate({ path: 'student', populate: { path: 'userId', select: 'name' } });
  res.json({ success: true, data: records });
});

// @route GET /api/attendance/student/:id  — summary per course
const getStudentAttendance = asyncHandler(async (req, res) => {
  // Student can only see their own attendance
  let studentId = req.params.id;
  if (req.user.role === 'student') {
    const profile = await Student.findOne({ userId: req.user._id });
    if (!profile) { res.status(404); throw new Error('Student profile not found'); }
    studentId = profile._id.toString();
  }

  const records = await Attendance.find({ student: studentId })
    .populate('course', 'name code');

  const summary = {};
  records.forEach(r => {
    if (!r.course) return;
    const key = r.course._id.toString();
    if (!summary[key]) summary[key] = { course: r.course, total: 0, present: 0 };
    summary[key].total++;
    if (r.status === 'present' || r.status === 'late') summary[key].present++;
  });

  const result = Object.values(summary).map(s => ({
    ...s,
    percentage: ((s.present / s.total) * 100).toFixed(1),
  }));

  res.json({ success: true, data: result });
});

// @route GET /api/attendance/monthly/:studentId?month=2025-03
const getMonthlyReport = asyncHandler(async (req, res) => {
  let { studentId } = req.params;

  // Student can only see their own report
  if (req.user.role === 'student') {
    const profile = await Student.findOne({ userId: req.user._id });
    if (!profile) { res.status(404); throw new Error('Student profile not found'); }
    studentId = profile._id.toString();
  }

  const { month } = req.query; // format: YYYY-MM

  const [year, mon] = (month || '').split('-').map(Number);
  if (!year || !mon) { res.status(400); throw new Error('Provide month as YYYY-MM'); }

  const start = new Date(`${year}-${String(mon).padStart(2,'0')}-01T00:00:00.000Z`);
  const end   = new Date(`${year}-${String(mon).padStart(2,'0')}-${new Date(year, mon, 0).getDate()}T23:59:59.999Z`);

  const records = await Attendance.find({
    student: studentId,
    date: { $gte: start, $lte: end },
  }).populate('course', 'name code').sort({ date: 1 });

  // Group by course
  const byDate = {};
  records.forEach(r => {
    const d = r.date.toISOString().split('T')[0];
    if (!byDate[d]) byDate[d] = [];
    byDate[d].push({ course: r.course?.name, status: r.status });
  });

  // Summary per course
  const summary = {};
  records.forEach(r => {
    if (!r.course) return;
    const key = r.course._id.toString();
    if (!summary[key]) summary[key] = { course: r.course, total: 0, present: 0, absent: 0, late: 0 };
    summary[key].total++;
    summary[key][r.status]++;
  });

  const courseSummary = Object.values(summary).map(s => ({
    ...s,
    percentage: ((s.present / s.total) * 100).toFixed(1),
  }));

  res.json({ success: true, data: { byDate, courseSummary, month } });
});

// @route GET /api/attendance/course/:courseId/report  — all students for a course
const getCourseAttendanceReport = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const { month } = req.query;

  const filter = { course: courseId };
  if (month) {
    const [year, mon] = month.split('-').map(Number);
    const lastDay = new Date(year, mon, 0).getDate();
    filter.date = {
      $gte: new Date(`${year}-${String(mon).padStart(2,'0')}-01T00:00:00.000Z`),
      $lte: new Date(`${year}-${String(mon).padStart(2,'0')}-${lastDay}T23:59:59.999Z`),
    };
  }

  const records = await Attendance.find(filter)
    .populate({ path: 'student', populate: { path: 'userId', select: 'name' } })
    .sort({ date: 1 });

  // Group by student
  const byStudent = {};
  records.forEach(r => {
    const sid = r.student?._id?.toString();
    if (!sid) return;
    if (!byStudent[sid]) byStudent[sid] = { student: r.student, total: 0, present: 0, absent: 0, late: 0 };
    byStudent[sid].total++;
    byStudent[sid][r.status]++;
  });

  const result = Object.values(byStudent).map(s => ({
    ...s,
    percentage: ((s.present / s.total) * 100).toFixed(1),
  }));

  res.json({ success: true, data: result });
});

// @route GET /api/attendance/stats — admin overview
const getAttendanceStats = asyncHandler(async (req, res) => {
  const User = require('../models/User');

  // Selected date (defaults to today) — parse as UTC to match how dates are stored
  const dateStr = req.query.date || new Date().toISOString().split('T')[0];
  const dayStart = new Date(dateStr + 'T00:00:00.000Z');
  const dayEnd   = new Date(dateStr + 'T23:59:59.999Z');
  const dayFilter = { date: { $gte: dayStart, $lte: dayEnd } };

  // Selected day KPIs
  const [dayPresent, dayAbsent, dayLate] = await Promise.all([
    Attendance.countDocuments({ ...dayFilter, status: 'present' }),
    Attendance.countDocuments({ ...dayFilter, status: 'absent' }),
    Attendance.countDocuments({ ...dayFilter, status: 'late' }),
  ]);
  const dayTotal = dayPresent + dayAbsent + dayLate;

  // Overall rate across all records
  const [allTotal, allPresent] = await Promise.all([
    Attendance.countDocuments(),
    Attendance.countDocuments({ status: { $in: ['present', 'late'] } }),
  ]);
  const overallRate = allTotal > 0 ? ((allPresent / allTotal) * 100).toFixed(1) : '0.0';

  // At-risk: unique students with < 75% in any course
  const atRiskAgg = await Attendance.aggregate([
    { $group: { _id: { student: '$student', course: '$course' }, total: { $sum: 1 }, present: { $sum: { $cond: [{ $in: ['$status', ['present', 'late']] }, 1, 0] } } } },
    { $match: { total: { $gt: 0 }, $expr: { $lt: [{ $divide: ['$present', '$total'] }, 0.75] } } },
  ]);
  const atRiskCount = new Set(atRiskAgg.map(r => r._id.student?.toString())).size;

  // Course-wise breakdown (all time, top 10)
  const courseAgg = await Attendance.aggregate([
    { $group: { _id: '$course', total: { $sum: 1 }, present: { $sum: { $cond: [{ $in: ['$status', ['present', 'late']] }, 1, 0] } } } },
    { $lookup: { from: 'courses', localField: '_id', foreignField: '_id', as: 'courseData' } },
    { $sort: { total: -1 } },
    { $limit: 10 },
  ]);
  const byCourse = courseAgg.map(c => ({
    courseName: c.courseData?.[0]?.name || 'Unknown',
    total: c.total,
    present: c.present,
  }));

  // Low attendance detail list
  const studentAgg = await Attendance.aggregate([
    { $group: { _id: { student: '$student', course: '$course' }, total: { $sum: 1 }, present: { $sum: { $cond: [{ $in: ['$status', ['present', 'late']] }, 1, 0] } } } },
    { $match: { total: { $gt: 0 }, $expr: { $lt: [{ $divide: ['$present', '$total'] }, 0.75] } } },
    { $lookup: { from: 'students', localField: '_id.student', foreignField: '_id', as: 'studentData' } },
    { $lookup: { from: 'courses', localField: '_id.course', foreignField: '_id', as: 'courseData' } },
    { $sort: { present: 1 } },
    { $limit: 20 },
  ]);

  const lowAttendance = await Promise.all(
    studentAgg.map(async (r) => {
      const studentDoc = r.studentData?.[0];
      let studentName = 'Unknown';
      if (studentDoc?.userId) {
        const userDoc = await User.findById(studentDoc.userId).select('name').lean();
        studentName = userDoc?.name || 'Unknown';
      }
      return {
        studentName,
        courseName: r.courseData?.[0]?.name || 'Unknown',
        present: r.present,
        total: r.total,
        percentage: r.total > 0 ? ((r.present / r.total) * 100).toFixed(1) : '0.0',
      };
    })
  );

  res.json({
    success: true,
    data: {
      dayPresent, dayAbsent, dayLate, dayTotal,
      overallRate, allTotal, allPresent,
      atRiskCount,
      byCourse, lowAttendance,
    },
  });
});

// @route PUT /api/attendance/:id  — admin correction
const correctAttendance = asyncHandler(async (req, res) => {
  const record = await Attendance.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!record) { res.status(404); throw new Error('Record not found'); }
  res.json({ success: true, data: record });
});

module.exports = {
  markAttendance,
  getAttendanceByDate,
  getStudentAttendance,
  getMonthlyReport,
  getCourseAttendanceReport,
  correctAttendance,
  getAttendanceStats,
};
