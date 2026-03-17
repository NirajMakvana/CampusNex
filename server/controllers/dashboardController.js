const asyncHandler = require('express-async-handler');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const Department = require('../models/Department');
const { Book } = require('../models/Library');
const { Fee } = require('../models/Fee');
const Attendance = require('../models/Attendance');
const Application = require('../models/Application');

// GET /api/dashboard/stats — single call for admin dashboard KPIs
const getAdminStats = asyncHandler(async (req, res) => {
  const [students, faculty, departments, books, feePending, feeCollected, applications] = await Promise.all([
    Student.countDocuments(),
    Faculty.countDocuments(),
    Department.countDocuments(),
    Book.countDocuments(),
    Fee.countDocuments({ status: { $in: ['pending', 'overdue'] } }),
    Fee.aggregate([{ $match: { status: 'paid' } }, { $group: { _id: null, total: { $sum: { $subtract: ['$amount', '$discount'] } } } }]),
    Application.countDocuments({ status: { $in: ['applied', 'under-review'] } }),
  ]);

  res.json({
    success: true,
    data: {
      students,
      faculty,
      departments,
      books,
      feePending,
      feeCollected: feeCollected[0]?.total || 0,
      pendingApplications: applications,
    },
  });
});

// GET /api/dashboard/stats/student — student's own dashboard KPIs
const getStudentStats = asyncHandler(async (req, res) => {
  const profile = await Student.findOne({ userId: req.user._id });
  if (!profile) { res.status(404); throw new Error('Student profile not found'); }

  const { BookIssue } = require('../models/Library');
  const { Fee: FeeModel } = require('../models/Fee');

  const [attRecords, fees, activeBooks] = await Promise.all([
    Attendance.find({ student: profile._id }).select('status'),
    FeeModel.find({ student: profile._id }),
    BookIssue.countDocuments({ student: profile._id, status: { $in: ['issued', 'overdue'] } }),
  ]);

  const total = attRecords.length;
  const present = attRecords.filter(r => r.status === 'present' || r.status === 'late').length;
  const attendance = total > 0 ? ((present / total) * 100).toFixed(1) : null;

  const feePending = fees.filter(f => f.status !== 'paid').reduce((s, f) => s + (f.amount - f.discount), 0);
  const overdueBooks = await BookIssue.countDocuments({ student: profile._id, status: 'overdue' });

  res.json({
    success: true,
    data: { attendance, feePending, activeBooks, overdueBooks, semester: profile.semester },
  });
});

module.exports = { getAdminStats, getStudentStats };

// GET /api/dashboard/fee-trend — last 6 months fee collection for chart
const getFeeCollectionTrend = asyncHandler(async (req, res) => {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const trend = await Fee.aggregate([
    {
      $match: {
        status: 'paid',
        paidDate: { $gte: sixMonthsAgo }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$paidDate' },
          month: { $month: '$paidDate' }
        },
        total: { $sum: { $subtract: ['$amount', '$discount'] } }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  // Format data for Recharts
  const chartData = trend.map(item => ({
    month: new Date(item._id.year, item._id.month - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    amount: item.total
  }));

  res.json({ success: true, data: chartData });
});

module.exports = { getAdminStats, getStudentStats, getFeeCollectionTrend };
