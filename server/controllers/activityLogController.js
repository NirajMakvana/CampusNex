const asyncHandler = require('express-async-handler');
const ActivityLog = require('../models/ActivityLog');

// GET /api/activity-logs — fetch activity logs with filters and pagination
const getActivityLogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search, module, user } = req.query;
  
  const query = {};
  
  // Search in action and details fields
  if (search) {
    query.$or = [
      { action: { $regex: search, $options: 'i' } },
      { details: { $regex: search, $options: 'i' } }
    ];
  }
  
  // Filter by module
  if (module) {
    query.module = module;
  }
  
  // Filter by user name (requires population)
  let userFilter = {};
  if (user) {
    userFilter = { 'user.name': { $regex: user, $options: 'i' } };
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  const [logs, totalCount] = await Promise.all([
    ActivityLog.find(query)
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    ActivityLog.countDocuments(query)
  ]);

  // Apply user filter after population if needed
  let filteredLogs = logs;
  if (user) {
    filteredLogs = logs.filter(log => 
      log.user && log.user.name && log.user.name.toLowerCase().includes(user.toLowerCase())
    );
  }

  const totalPages = Math.ceil(totalCount / parseInt(limit));

  res.json({
    success: true,
    data: filteredLogs,
    pagination: {
      currentPage: parseInt(page),
      totalPages,
      totalCount,
      hasNext: parseInt(page) < totalPages,
      hasPrev: parseInt(page) > 1
    },
    totalPages // For backward compatibility
  });
});

// Helper function to create activity log (used by other controllers)
const createActivityLog = async (userId, action, module = null, details = null, ip = null) => {
  try {
    await ActivityLog.create({
      user: userId,
      action,
      module,
      details,
      ip
    });
  } catch (error) {
    console.error('Failed to create activity log:', error);
    // Don't throw error to avoid breaking main operations
  }
};

module.exports = {
  getActivityLogs,
  createActivityLog
};