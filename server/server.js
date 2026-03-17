require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');

// Route imports
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const facultyRoutes = require('./routes/facultyRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const courseRoutes = require('./routes/courseRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const examRoutes = require('./routes/examRoutes');
const feeRoutes = require('./routes/feeRoutes');
const noticeRoutes = require('./routes/noticeRoutes');
const timetableRoutes = require('./routes/timetableRoutes');
const libraryRoutes = require('./routes/libraryRoutes');
const hostelRoutes = require('./routes/hostelRoutes');
const activityRoutes = require('./routes/activityRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const startAttendanceAlertJob = require('./jobs/attendanceAlert');
const startFeeReminderJob = require('./jobs/feeReminder');

connectDB();

const app = express();

// Security & logging
app.use(helmet());
app.use(morgan('dev'));
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500,
  message: { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'development',
}));

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api/hostel', hostelRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/activity-logs', require('./routes/activityLogRoutes'));
app.use('/api/revaluation', require('./routes/revaluationRoutes'));
app.use('/api/testimonials', require('./routes/testimonialRoutes'));
app.use('/api/website', require('./routes/websiteRoutes'));

// Admission routes - mounted at both /api/admissions (protected) and /api/public (public)
// Note: Route-level auth in admissionRoutes.js ensures proper access control
const admissionRoutes = require('./routes/admissionRoutes');
app.use('/api/admissions', admissionRoutes);
app.use('/api/public', admissionRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'CampusNex API running' }));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  startAttendanceAlertJob();
  startFeeReminderJob();
});
