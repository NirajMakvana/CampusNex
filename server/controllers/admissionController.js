const asyncHandler = require('express-async-handler');
const Application = require('../models/Application');
const AdmissionSettings = require('../models/AdmissionSettings');
const ContactMessage = require('../models/ContactMessage');
const Student = require('../models/Student');
const User = require('../models/User');
const Department = require('../models/Department');
const uploadToCloudinary = require('../utils/uploadToCloudinary');
const sendEmail = require('../utils/sendEmail');
const logActivity = require('../utils/logActivity');

// ─── PUBLIC ROUTES ────────────────────────────────────────────────────────────

// GET /api/public/stats
const getPublicStats = asyncHandler(async (req, res) => {
  const [students, faculty, departments] = await Promise.all([
    Student.countDocuments({ isActive: true }),
    require('../models/Faculty').countDocuments({ isActive: true }),
    Department.countDocuments(),
  ]);
  res.json({ success: true, data: { students, faculty, departments, yearsEstablished: new Date().getFullYear() - 2010 } });
});

// GET /api/public/admission-settings
const getPublicAdmissionSettings = asyncHandler(async (req, res) => {
  const year = new Date().getFullYear();
  const settings = await AdmissionSettings.findOne({
    academicYear: { $in: [`${year}-${String(year + 1).slice(-2)}`, `${year - 1}-${String(year).slice(-2)}`] },
  }).sort({ createdAt: -1 });
  res.json({ success: true, data: settings });
});

// GET /api/public/notices
const getPublicNotices = asyncHandler(async (req, res) => {
  const Notice = require('../models/Notice');
  const notices = await Notice.find({ targetRole: 'all' }).sort({ createdAt: -1 }).limit(5).select('title message createdAt');
  res.json({ success: true, data: notices });
});

// GET /api/public/departments
const getPublicDepartments = asyncHandler(async (req, res) => {
  const departments = await Department.find().select('name code description');
  res.json({ success: true, data: departments });
});

// GET /api/public/faculty
const getPublicFaculty = asyncHandler(async (req, res) => {
  const Faculty = require('../models/Faculty');
  const faculty = await Faculty.find()
    .populate('department', 'name')
    .populate('userId', 'name avatar')
    .select('userId department designation joiningDate');
  res.json({ success: true, data: faculty });
});

// POST /api/public/contact
const submitContact = asyncHandler(async (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !subject || !message) {
    res.status(400); throw new Error('All fields are required');
  }
  await ContactMessage.create({ name, email, subject, message });
  res.status(201).json({ success: true, message: 'Message received. We will get back to you soon.' });
});

// ─── APPLICATION ROUTES ───────────────────────────────────────────────────────

// POST /api/admissions/apply  (multipart/form-data)
const submitApplication = asyncHandler(async (req, res) => {
  const settings = await AdmissionSettings.findOne({ isOpen: true });
  if (!settings) {
    res.status(400); throw new Error('Admissions are currently closed.');
  }

  const body = req.body;
  const files = req.files || {};

  // Upload documents to Cloudinary
  const documents = {};
  const docFields = ['photo', 'marksheet12', 'marksheet10', 'categoryCert', 'aadhar'];
  for (const field of docFields) {
    if (files[field] && files[field][0]) {
      const result = await uploadToCloudinary(files[field][0].buffer, 'campusnex/admissions');
      documents[field] = result.secure_url;
    }
  }

  // Parse nested JSON fields sent as strings from FormData
  const personalInfo = typeof body.personalInfo === 'string' ? JSON.parse(body.personalInfo) : body.personalInfo;
  const academicInfo = typeof body.academicInfo === 'string' ? JSON.parse(body.academicInfo) : body.academicInfo;
  const coursePreference = typeof body.coursePreference === 'string' ? JSON.parse(body.coursePreference) : body.coursePreference;

  const application = await Application.create({
    personalInfo,
    academicInfo,
    coursePreference,
    documents,
    academicYear: settings.academicYear,
    applicationFee: { amount: settings.applicationFee, status: 'pending' },
  });

  // Send confirmation email
  try {
    await sendEmail({
      to: personalInfo.email,
      subject: 'Application Received — CampusNex',
      html: `
        <h2>Application Received!</h2>
        <p>Dear ${personalInfo.name},</p>
        <p>Your application has been received successfully.</p>
        <p><strong>Application ID: ${application.applicationId}</strong></p>
        <p>Track your application at: <a href="${process.env.CLIENT_URL}/admissions/track">Track Application</a></p>
        <p>We will review your application and update you shortly.</p>
        <br><p>— CampusNex Admissions Team</p>
      `,
    });
  } catch (_) { /* email failure should not block response */ }

  res.status(201).json({
    success: true,
    data: {
      applicationId: application.applicationId,
      status: application.status,
      applicationFeeAmount: settings.applicationFee,
    },
  });
});

// POST /api/admissions/track
const trackApplication = asyncHandler(async (req, res) => {
  const { applicationId, email } = req.body;
  if (!applicationId || !email) {
    res.status(400); throw new Error('Application ID and email are required');
  }
  const app = await Application.findOne({ applicationId, 'personalInfo.email': email.toLowerCase() })
    .select('-reviewedBy')
    .populate('allocatedProgram', 'name');
  if (!app) { res.status(404); throw new Error('Application not found. Check your Application ID and email.'); }
  res.json({ success: true, data: app });
});

// POST /api/admissions/payment/simulate  — simulated payment (no real gateway)
const simulatePayment = asyncHandler(async (req, res) => {
  const { applicationId, type } = req.body; // type: 'application' | 'confirmation'
  const application = await Application.findOne({ applicationId });
  if (!application) { res.status(404); throw new Error('Application not found'); }

  const feeField = type === 'confirmation' ? 'confirmationFee' : 'applicationFee';
  application[feeField].status = 'paid';
  application[feeField].paidAt = new Date();
  application[feeField].razorpayPaymentId = `SIM_TXN_${Date.now()}`;

  if (type !== 'confirmation') {
    application.status = 'under-review';
    application.statusUpdatedAt = new Date();
  }
  await application.save();

  res.json({ success: true, message: 'Payment recorded', status: application.status });
});

// ─── ADMIN ROUTES ─────────────────────────────────────────────────────────────

// GET /api/admissions  — all applications with filters
const getApplications = asyncHandler(async (req, res) => {
  const { status, search, page = 1, limit = 20, academicYear } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (academicYear) filter.academicYear = academicYear;

  if (search) {
    filter.$or = [
      { applicationId: { $regex: search, $options: 'i' } },
      { 'personalInfo.name': { $regex: search, $options: 'i' } },
      { 'personalInfo.email': { $regex: search, $options: 'i' } },
    ];
  }

  const total = await Application.countDocuments(filter);
  const applications = await Application.find(filter)
    .populate('allocatedProgram', 'name')
    .populate('reviewedBy', 'name')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  res.json({ success: true, count: total, pages: Math.ceil(total / limit), data: applications });
});

// GET /api/admissions/:id
const getApplication = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id)
    .populate('allocatedProgram', 'name code')
    .populate('reviewedBy', 'name')
    .populate('studentCreated', 'enrollmentNo');
  if (!application) { res.status(404); throw new Error('Application not found'); }
  res.json({ success: true, data: application });
});

// PUT /api/admissions/:id/status  — update status + optional remark
const updateApplicationStatus = asyncHandler(async (req, res) => {
  const { status, adminRemarks, allocatedProgram } = req.body;
  const application = await Application.findById(req.params.id);
  if (!application) { res.status(404); throw new Error('Application not found'); }

  const prevStatus = application.status;
  application.status = status;
  application.statusUpdatedAt = new Date();
  application.reviewedBy = req.user._id;
  if (adminRemarks) application.adminRemarks = adminRemarks;
  if (allocatedProgram) application.allocatedProgram = allocatedProgram;

  // Auto-create student account on confirmation
  if (status === 'confirmed' && prevStatus !== 'confirmed') {
    const tempPassword = `CX@${Math.random().toString(36).slice(-6).toUpperCase()}`;
    const user = await User.create({
      name: application.personalInfo.name,
      email: application.personalInfo.email,
      password: tempPassword,
      role: 'student',
    });

    // Generate enrollment number
    const count = await Student.countDocuments();
    const enrollmentNo = `CX${new Date().getFullYear()}${String(count + 1).padStart(4, '0')}`;

    const dept = allocatedProgram || application.allocatedProgram;
    const student = await Student.create({
      userId: user._id,
      enrollmentNo,
      department: dept,
      semester: 1,
      batch: application.academicYear,
      dob: application.personalInfo.dob,
      gender: application.personalInfo.gender?.toLowerCase(),
      phone: application.personalInfo.mobile,
      address: `${application.personalInfo.address?.city}, ${application.personalInfo.address?.state}`,
    });

    application.studentCreated = student._id;
    await application.save();

    // Send welcome email with credentials
    try {
      await sendEmail({
        to: application.personalInfo.email,
        subject: 'Admission Confirmed — Welcome to CampusNex!',
        html: `
          <h2>Congratulations! Your admission is confirmed.</h2>
          <p>Dear ${application.personalInfo.name},</p>
          <p>Your student account has been created. Login to the portal using:</p>
          <p><strong>Email:</strong> ${application.personalInfo.email}</p>
          <p><strong>Password:</strong> ${tempPassword}</p>
          <p><strong>Enrollment No:</strong> ${enrollmentNo}</p>
          <p><a href="${process.env.CLIENT_URL}/login">Login to Portal →</a></p>
          <p>Please change your password after first login.</p>
          <br><p>— CampusNex Team</p>
        `,
      });
    } catch (_) {}

    logActivity(req.user._id, `Confirmed admission & created student account for ${application.personalInfo.name}`, 'Admissions');
    return res.json({ success: true, data: application, studentCreated: { enrollmentNo, email: application.personalInfo.email } });
  }

  await application.save();

  // Send status update email
  const emailMap = {
    'under-review': { subject: 'Application Under Review', body: 'Your documents are being verified.' },
    'shortlisted': { subject: 'Congratulations! You are Shortlisted', body: 'You have been shortlisted. Please pay the confirmation fee to secure your seat.' },
    'fee-pending': { subject: 'Confirmation Fee Reminder', body: 'Please pay the confirmation fee before the deadline.' },
    'rejected': { subject: 'Application Status Update', body: `We regret to inform you that your application has been rejected. ${adminRemarks ? `Reason: ${adminRemarks}` : ''}` },
  };

  if (emailMap[status]) {
    try {
      await sendEmail({
        to: application.personalInfo.email,
        subject: `${emailMap[status].subject} — CampusNex`,
        html: `<p>Dear ${application.personalInfo.name},</p><p>${emailMap[status].body}</p><p><a href="${process.env.CLIENT_URL}/admissions/track">Track Application →</a></p><br><p>— CampusNex Admissions Team</p>`,
      });
    } catch (_) {}
  }

  logActivity(req.user._id, `Updated application ${application.applicationId} status to ${status}`, 'Admissions');
  res.json({ success: true, data: application });
});

// GET /api/admissions/merit-list?program=BCA&academicYear=2025-26
const getMeritList = asyncHandler(async (req, res) => {
  const { program, academicYear } = req.query;
  const filter = { status: { $in: ['shortlisted', 'fee-pending', 'confirmed'] } };
  if (academicYear) filter.academicYear = academicYear;
  if (program) filter['coursePreference.program'] = program;

  const applications = await Application.find(filter)
    .sort({ 'academicInfo.percentage': -1 })
    .select('applicationId personalInfo academicInfo coursePreference status allocatedProgram')
    .populate('allocatedProgram', 'name');

  res.json({ success: true, count: applications.length, data: applications });
});

// ─── ADMISSION SETTINGS ───────────────────────────────────────────────────────

// GET /api/admissions/settings
const getSettings = asyncHandler(async (req, res) => {
  const settings = await AdmissionSettings.find().sort({ createdAt: -1 });
  res.json({ success: true, data: settings });
});

// POST /api/admissions/settings
const createSettings = asyncHandler(async (req, res) => {
  const settings = await AdmissionSettings.create(req.body);
  res.status(201).json({ success: true, data: settings });
});

// PUT /api/admissions/settings/:id
const updateSettings = asyncHandler(async (req, res) => {
  const settings = await AdmissionSettings.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!settings) { res.status(404); throw new Error('Settings not found'); }
  res.json({ success: true, data: settings });
});

// ─── CONTACT MESSAGES (Admin) ─────────────────────────────────────────────────

// GET /api/admissions/contacts
const getContactMessages = asyncHandler(async (req, res) => {
  const messages = await ContactMessage.find().sort({ createdAt: -1 });
  res.json({ success: true, data: messages });
});

// PUT /api/admissions/contacts/:id/read
const markContactRead = asyncHandler(async (req, res) => {
  await ContactMessage.findByIdAndUpdate(req.params.id, { isRead: true });
  res.json({ success: true });
});

module.exports = {
  getPublicStats, getPublicAdmissionSettings, getPublicNotices, getPublicDepartments, getPublicFaculty,
  submitContact, submitApplication, trackApplication, simulatePayment,
  getApplications, getApplication, updateApplicationStatus, getMeritList,
  getSettings, createSettings, updateSettings,
  getContactMessages, markContactRead,
};
