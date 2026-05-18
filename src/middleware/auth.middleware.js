const User = require('../models/user.model');
const { verifyAccessToken } = require('../utils/jwt');
const { sendError } = require('../utils/response');

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, 401, 'Access token is missing');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      return sendError(res, 401, 'User no longer exists or is inactive');
    }

    req.user = user;
    next();
  } catch (err) {
    return sendError(res, 401, 'Invalid or expired access token');
  }
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return sendError(res, 403, 'You do not have permission to perform this action');
    }
    next();
  };
};

module.exports = { protect, restrictTo };
