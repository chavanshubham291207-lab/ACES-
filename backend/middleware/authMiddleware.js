const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'aces_super_secret_jwt_key_2026');

      req.user = await User.findById(decoded.id).select('-password').populate('team position');
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'User account not found' });
      }

      if (req.user.isActive === false || (req.user.status && req.user.status.toLowerCase() === 'inactive')) {
        return res.status(403).json({ success: false, message: 'Your account is deactivated' });
      }

      return next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ success: false, message: 'Not authorized, invalid or expired token' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};

module.exports = { protect };
