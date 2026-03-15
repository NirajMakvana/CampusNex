const asyncHandler = require('express-async-handler');
const Notice = require('../models/Notice');
const uploadToCloudinary = require('../utils/uploadToCloudinary');
const sendEmail = require('../utils/sendEmail');
const User = require('../models/User');

const getNotices = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
    filter.$or = [{ targetRole: 'all' }, { targetRole: req.user.role }];
  }
  if (req.query.search) {
    const regex = new RegExp(req.query.search, 'i');
    const searchFilter = { $or: [{ title: regex }, { message: regex }] };
    filter.$and = filter.$and ? [...filter.$and, searchFilter] : [searchFilter];
  }
  const notices = await Notice.find(filter)
    .populate('postedBy', 'name role')
    .sort({ isPinned: -1, createdAt: -1 });
  res.json({ success: true, data: notices });
});

const createNotice = asyncHandler(async (req, res) => {
  const attachments = [];
  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      const result = await uploadToCloudinary(file.buffer, 'campusnex/notices');
      attachments.push(result.secure_url);
    }
  }
  const notice = await Notice.create({ ...req.body, postedBy: req.user._id, attachments });

  // Send email notification to targeted users (fire-and-forget)
  try {
    const roleFilter = req.body.targetRole === 'all' ? {} : { role: req.body.targetRole };
    const users = await User.find({ ...roleFilter, isActive: true }).select('email name');
    if (users.length > 0) {
      // Send individually to avoid exposing all emails in To field
      const emailPromises = users.map(u => sendEmail({
        to: u.email,
        subject: `[CampusNex Notice] ${notice.title}`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:auto">
            <h2 style="color:#4f46e5">CampusNex — New Notice</h2>
            <h3>${notice.title}</h3>
            <p style="color:#555">${notice.message}</p>
            ${notice.isPinned ? '<p style="color:#dc2626;font-weight:bold">📌 This is a pinned notice</p>' : ''}
            <hr/>
            <p style="font-size:12px;color:#999">Posted by ${req.user.name} • CampusNex Campus Management System</p>
          </div>
        `,
      }).catch(() => {})); // ignore individual failures
      await Promise.allSettled(emailPromises);
    }
  } catch (emailErr) {
    // Don't fail the request if email fails
    console.error('Notice email failed:', emailErr.message);
  }

  res.status(201).json({ success: true, data: notice });
});

const updateNotice = asyncHandler(async (req, res) => {
  const notice = await Notice.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!notice) { res.status(404); throw new Error('Notice not found'); }
  res.json({ success: true, data: notice });
});

const deleteNotice = asyncHandler(async (req, res) => {
  const notice = await Notice.findByIdAndDelete(req.params.id);
  if (!notice) { res.status(404); throw new Error('Notice not found'); }
  res.json({ success: true, message: 'Notice deleted' });
});

module.exports = { getNotices, createNotice, updateNotice, deleteNotice };
