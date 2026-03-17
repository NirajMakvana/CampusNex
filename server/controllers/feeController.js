const asyncHandler = require('express-async-handler');
const { Fee, FeeStructure } = require('../models/Fee');
const Student = require('../models/Student');

// Fee Structures
const getFeeStructures = asyncHandler(async (req, res) => {
  const structures = await FeeStructure.find().populate('department', 'name code');
  res.json({ success: true, data: structures });
});

const createFeeStructure = asyncHandler(async (req, res) => {
  const structure = await FeeStructure.create(req.body);
  const populated = await structure.populate('department', 'name code');
  res.status(201).json({ success: true, data: populated });
});

const updateFeeStructure = asyncHandler(async (req, res) => {
  const structure = await FeeStructure.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('department', 'name code');
  if (!structure) { res.status(404); throw new Error('Not found'); }
  res.json({ success: true, data: structure });
});

const deleteFeeStructure = asyncHandler(async (req, res) => {
  await FeeStructure.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Deleted' });
});

// Student Fees
const getStudentFees = asyncHandler(async (req, res) => {
  // Student can only see their own fees — always resolve from token
  let studentId = req.params.id;
  if (req.user.role === 'student' || studentId === 'me') {
    const profile = await Student.findOne({ userId: req.user._id });
    if (!profile) { res.status(404); throw new Error('Student profile not found'); }
    studentId = profile._id.toString();
  }

  const fees = await Fee.find({ student: studentId })
    .populate('feeStructure')
    .sort({ createdAt: -1 });
  const total = fees.reduce((sum, f) => sum + (f.amount - f.discount), 0);
  const paid = fees.filter(f => f.status === 'paid').reduce((sum, f) => sum + (f.amount - f.discount), 0);
  res.json({ success: true, data: fees, summary: { total, paid, pending: total - paid } });
});

const assignFee = asyncHandler(async (req, res) => {
  const fee = await Fee.create(req.body);
  res.status(201).json({ success: true, data: fee });
});

// Bulk assign fee to all students in a dept/semester
const bulkAssignFee = asyncHandler(async (req, res) => {
  const { feeStructureId, department, semester, dueDate } = req.body;
  const structure = await FeeStructure.findById(feeStructureId);
  if (!structure) { res.status(404); throw new Error('Fee structure not found'); }

  const filter = {};
  if (department) filter.department = department;
  if (semester) filter.semester = semester;
  const students = await Student.find(filter);

  const ops = students.map(s => ({
    updateOne: {
      filter: { student: s._id, feeStructure: feeStructureId },
      update: { $setOnInsert: { student: s._id, feeStructure: feeStructureId, amount: structure.amount, dueDate, status: 'pending', discount: 0 } },
      upsert: true,
    },
  }));

  await Fee.bulkWrite(ops);
  res.json({ success: true, message: `Fee assigned to ${students.length} students` });
});

const markFeePaid = asyncHandler(async (req, res) => {
  const fee = await Fee.findById(req.params.id).populate('student');
  if (!fee) { res.status(404); throw new Error('Fee record not found'); }
  
  // Security check: students can only pay their own fees
  if (req.user.role === 'student') {
    const studentProfile = await Student.findOne({ userId: req.user._id });
    if (!studentProfile || fee.student._id.toString() !== studentProfile._id.toString()) {
      res.status(403); throw new Error('You can only pay your own fees');
    }
  }
  
  const updatedFee = await Fee.findByIdAndUpdate(
    req.params.id,
    { 
      status: 'paid', 
      paidDate: new Date(), 
      transactionId: req.body.transactionId || `MANUAL-${Date.now()}`,
      paymentMethod: req.body.paymentMethod || 'simulated'
    },
    { new: true }
  );
  
  res.json({ success: true, data: updatedFee });
});

const applyDiscount = asyncHandler(async (req, res) => {
  const discount = Number(req.body.discount);
  if (isNaN(discount) || discount < 0) {
    res.status(400); throw new Error('Discount must be a non-negative number');
  }
  const fee = await Fee.findById(req.params.id);
  if (!fee) { res.status(404); throw new Error('Not found'); }
  if (discount > fee.amount) {
    res.status(400); throw new Error('Discount cannot exceed fee amount');
  }
  fee.discount = discount;
  await fee.save();
  res.json({ success: true, data: fee });
});

const getDefaulters = asyncHandler(async (req, res) => {
  // Mark overdue fees
  await Fee.updateMany(
    { status: 'pending', dueDate: { $lt: new Date() } },
    { $set: { status: 'overdue' } }
  );

  const defaulters = await Fee.find({ status: { $in: ['pending', 'overdue'] } })
    .populate({
      path: 'student',
      populate: [{ path: 'userId', select: 'name email' }, { path: 'department', select: 'name' }],
    })
    .populate('feeStructure', 'academicYear description')
    .sort({ dueDate: 1 });

  res.json({ success: true, count: defaulters.length, data: defaulters });
});

// Summary stats for admin dashboard
const getFeeStats = asyncHandler(async (req, res) => {
  const [totalAgg, paidAgg, overdueAgg, paidCount, pendingCount, overdueCount, totalCount] = await Promise.all([
    Fee.aggregate([{ $group: { _id: null, total: { $sum: { $subtract: ['$amount', '$discount'] } } } }]),
    Fee.aggregate([{ $match: { status: 'paid' } }, { $group: { _id: null, total: { $sum: { $subtract: ['$amount', '$discount'] } } } }]),
    Fee.aggregate([{ $match: { status: 'overdue' } }, { $group: { _id: null, total: { $sum: { $subtract: ['$amount', '$discount'] } } } }]),
    Fee.countDocuments({ status: 'paid' }),
    Fee.countDocuments({ status: 'pending' }),
    Fee.countDocuments({ status: 'overdue' }),
    Fee.countDocuments(),
  ]);
  res.json({
    success: true,
    data: {
      totalAmount: totalAgg[0]?.total || 0,
      collectedAmount: paidAgg[0]?.total || 0,
      overdueAmount: overdueAgg[0]?.total || 0,
      totalCount,
      paidCount,
      pendingCount,
      overdueCount,
    },
  });
});

module.exports = { getFeeStructures, createFeeStructure, updateFeeStructure, deleteFeeStructure, getStudentFees, assignFee, bulkAssignFee, markFeePaid, applyDiscount, getDefaulters, getFeeStats };
