const cron = require('node-cron');
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const User = require('../models/User');
const Course = require('../models/Course');
const sendEmail = require('../utils/sendEmail');

// Runs every Monday at 8 AM — checks students below 75% attendance
const startAttendanceAlertJob = () => {
  cron.schedule('0 8 * * 1', async () => {
    console.log('[CRON] Running low-attendance check...');
    try {
      const students = await Student.find({ isActive: true }).populate('userId', 'name email');
      const courses = await Course.find();

      for (const student of students) {
        const alerts = [];

        for (const course of courses) {
          const total = await Attendance.countDocuments({ student: student._id, course: course._id });
          if (total === 0) continue;

          const present = await Attendance.countDocuments({
            student: student._id,
            course: course._id,
            status: { $in: ['present', 'late'] },
          });

          const percentage = (present / total) * 100;
          if (percentage < 75) {
            alerts.push({ course: course.name, percentage: percentage.toFixed(1), present, total });
          }
        }

        if (alerts.length > 0 && student.userId?.email) {
          const rows = alerts.map(a =>
            `<tr>
              <td style="padding:8px;border-bottom:1px solid #eee">${a.course}</td>
              <td style="padding:8px;border-bottom:1px solid #eee;color:#dc2626;font-weight:600">${a.percentage}%</td>
              <td style="padding:8px;border-bottom:1px solid #eee">${a.present}/${a.total}</td>
            </tr>`
          ).join('');

          await sendEmail({
            to: student.userId.email,
            subject: '⚠️ CampusNex — Low Attendance Alert',
            html: `
              <div style="font-family:sans-serif;max-width:600px;margin:auto">
                <h2 style="color:#4F46E5">CampusNex — Attendance Warning</h2>
                <p>Dear <strong>${student.userId.name}</strong>,</p>
                <p>Your attendance is below <strong>75%</strong> in the following subjects:</p>
                <table style="width:100%;border-collapse:collapse;margin:16px 0">
                  <thead>
                    <tr style="background:#f1f5f9">
                      <th style="padding:8px;text-align:left">Subject</th>
                      <th style="padding:8px;text-align:left">Attendance %</th>
                      <th style="padding:8px;text-align:left">Classes</th>
                    </tr>
                  </thead>
                  <tbody>${rows}</tbody>
                </table>
                <p style="color:#64748b;font-size:13px">Please improve your attendance to avoid academic consequences.</p>
                <p style="color:#64748b;font-size:13px">— CampusNex Team</p>
              </div>
            `,
          });
        }
      }
      console.log('[CRON] Attendance alert job completed');
    } catch (err) {
      console.error('[CRON] Error:', err.message);
    }
  });
};

module.exports = startAttendanceAlertJob;
