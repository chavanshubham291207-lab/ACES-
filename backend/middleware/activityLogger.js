const ActivityLog = require('../models/ActivityLog');

const logActivity = (action, moduleName, getDetails) => {
  return async (req, res, next) => {
    // Intercept res.json to log upon successful response
    const originalJson = res.json;
    res.json = function (data) {
      if (data && data.success !== false) {
        try {
          const details = typeof getDetails === 'function' ? getDetails(req, data) : (getDetails || `${action} executed`);
          ActivityLog.create({
            user: req.user ? req.user._id : null,
            userName: req.user ? req.user.name : 'System/Guest',
            action,
            module: moduleName,
            details,
            ip: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1'
          }).catch(err => console.error('Activity Log Error:', err.message));
        } catch (e) {
          console.error('Logger Exception:', e);
        }
      }
      return originalJson.call(this, data);
    };
    next();
  };
};

module.exports = { logActivity };
