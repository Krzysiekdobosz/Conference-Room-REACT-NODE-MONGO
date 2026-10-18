const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { jwtSecret, jwtExpiresIn } = require('../config/env');
const { authenticate } = require('../middleware/auth');
const { HttpError, asyncHandler } = require('../utils/httpError');

const router = express.Router();

const signToken = (user) => jwt.sign({ sub: user.id, role: user.role }, jwtSecret, { expiresIn: jwtExpiresIn });

router.post('/register', asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new HttpError(400, 'Name, email and password are required');
  }
  if (password.length < 6) {
    throw new HttpError(400, 'Password must be at least 6 characters long');
  }

  const user = await User.create({ name, email, password });
  res.status(201).json({ token: signToken(user), user });
}));

router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: String(email || '').toLowerCase() }).select('+password');

  if (!user || !(await user.comparePassword(password || ''))) {
    throw new HttpError(401, 'Invalid email or password');
  }

  res.json({ token: signToken(user), user });
}));

router.get('/me', authenticate, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
