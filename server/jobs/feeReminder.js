const cron = require('node-cron');
const Fee = require('../models/Fee');
const sendEmail = require('../utils/sendEmail');

// Runs every Monday at 9 AM
const startFeeReminderJob = () => {
  cron.schedule('0 9 * * 1', async () => {
    console.log('[FeeReminder] Running weekly pending fee reminder...');
    try {
      const overdueFees = await Fee.find({ status: { $in: ['pending', 'overdue'] } })
        .populate({ path: 'student', populate: { path: 'userId', select: 'name email' } })
        .populate('feeStructure', 'description academicYear');

      for (const fee of overdueFees) {
        const email = fee.student?.userId?.email;
        const name = fee.student?.userId?.name;
        if (!email) continue;
        const netAmount = (fee.amount - fee.discount).toLocaleString('en-IN');
        const dueDate = fee.dueDate ? new Date(fee.dueDate).toLocaleDateString('en-IN') : 'N/A';
        await sendEmail({
          to: email,
          subject: 'Pending Fee Reminder — CampusNex',
          html: `
            <div style="font-family:sans-serif;max-width:500px;margin:auto;padding:24px;border:1px solid #e2e8f0;border-radius:12px">
              <h2 style="color:#4F46E5">CampusNex — Fee Reminder</h2>
              <p>Dear <strong>${name}</strong>,</p>
              <p>This is a reminder that you have a pending fee of <strong>₹${netAmount}</strong> due on <strong>${dueDate}</strong>.</p>
              <p>Description: ${fee.feeStructure?.description || fee.feeStructure?.academicYear || 'Fee'}</p>
              <p>Please clear your dues at the earliest to avoid any inconvenience.</p>
              <p style="color:#64748b;font-size:12px;margin-top:24px">CampusNex Administration</p>
            </div>
          `,
        });
      }
      console.log(`[FeeReminder] Sent reminders to ${overdueFees.length} students`);
    } catch (err) {
      console.error('[FeeReminder] Error:', err.message);
    }
  });
  console.log('[FeeReminder] Weekly fee reminder job scheduled (Mon 9 AM)');
};

module.exports = startFeeReminderJob;
