const asyncHandler = require('express-async-handler');
const WebsiteSettings = require('../models/WebsiteSettings');

// GET /api/public/settings
const getSettings = asyncHandler(async (req, res) => {
  let settings = await WebsiteSettings.findOne({});
  if (!settings) {
    settings = await WebsiteSettings.create({});
  }
  res.json({ success: true, data: settings });
});

// PUT /api/website/settings (Admin only)
const updateSettings = asyncHandler(async (req, res) => {
  let settings = await WebsiteSettings.findOne({});
  if (!settings) {
    settings = await WebsiteSettings.create(req.body);
  } else {
    settings = await WebsiteSettings.findByIdAndUpdate(settings._id, req.body, { new: true });
  }
  res.json({ success: true, data: settings });
});

module.exports = { getSettings, updateSettings };
