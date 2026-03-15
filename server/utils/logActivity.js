const ActivityLog = require('../models/ActivityLog');

/**
 * Log a user action. Fire-and-forget — never throws.
 * @param {string} userId
 * @param {string} action  - e.g. "Created student John Doe"
 * @param {string} module  - e.g. "Students"
 * @param {string} [details]
 * @param {string} [ip]
 */
const logActivity = (userId, action, module, details = '', ip = '') => {
  ActivityLog.create({ user: userId, action, module, details, ip }).catch(() => {});
};

module.exports = logActivity;
