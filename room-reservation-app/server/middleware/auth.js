const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/env');
const User = require('../models/User');
const { HttpError, asyncHandler } = require('../utils/httpError');

const authenticate = asyncHandler(async (req, res, next) => {
  const [scheme, token] = (req.headers.authorization || '').split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw new HttpError(401, 'Authentication required');
  }

  let payload;
  try {
    payload = jwt.verify(token, jwtSecret);
  } catch {
    throw new HttpError(401, 'Invalid or expired token');
  }

  const user = await User.findById(payload.sub);
  if (!user) {
    throw new HttpError(401, 'User no longer exists');
  }

  req.user = user;
  next();
});

const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return next(new HttpError(403, 'Admin access required'));
  }
  next();
};

module.exports = { authenticate, requireAdmin };
