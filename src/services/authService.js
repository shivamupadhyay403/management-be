const bcrypt = require('bcryptjs');
const User = require('../models/User');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require('../utils/jwtUtils.js');
const AppError = require('../utils/AppError');
// ── Register ───────────────────────────────────────────────────────────────
const register = async ({ fullName, email, password, role }) => {
  // 1. Check if email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error('Email is already registered');
    error.statusCode = 409;
    throw error;
  }

  // 2. Hash the password (salt rounds = 12)
  const hashedPassword = await bcrypt.hash(password, 12);

  // 3. Create user
  const user = await User.create({
    fullName,
    email,
    password: hashedPassword,
    role: role || 'student',
  });

  // 4. Generate tokens
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // 5. Hash and store refresh token in DB
  //    (so we can invalidate it on logout)
  const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
  user.refreshToken = hashedRefreshToken;
  await user.save();

  return {
    user: sanitizeUser(user),
    accessToken,
    refreshToken,
  };
};

// ── Login ──────────────────────────────────────────────────────────────────
// services/authService.js
const login = async ({ email, password }) => {
  const user = await User.findOne({ email });

  // Deliberately vague — don't leak whether email exists
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new AppError('Invalid email or password', 401);
  }

  if (!user.isActive) {
    throw new AppError('Account deactivated. Contact admin.', 403);
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshToken = await bcrypt.hash(refreshToken, 10);
  await user.save();

  return { user: sanitizeUser(user), accessToken, refreshToken };
};
// ── Refresh Access Token ───────────────────────────────────────────────────
const refreshAccessToken = async (refreshToken) => {
  // 1. Verify the refresh token signature + expiry
  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    const error = new Error('Invalid or expired refresh token');
    error.statusCode = 401;
    error.data = null;
    throw error;
  }

  // 2. Find user
  const user = await User.findById(decoded.id);
  if (!user || !user.refreshToken) {
    const error = new Error('Refresh token not found. Please login again.');
    error.statusCode = 401;
    error.data = null;
    throw error;
  }

  // 3. Compare incoming refresh token with stored hashed token
  const isTokenValid = await bcrypt.compare(refreshToken, user.refreshToken);
  if (!isTokenValid) {
    // Token reuse detected — clear stored token (security measure)
    user.refreshToken = null;
    await user.save();
    const error = new Error('Refresh token reuse detected. Please login again.');
    error.data = null;
    error.statusCode = 401;
    throw error;
  }

  // 4. Issue new access token and rotate refresh token
  const newAccessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);

  // 5. Store new hashed refresh token
  const hashedRefreshToken = await bcrypt.hash(newRefreshToken, 10);
  user.refreshToken = hashedRefreshToken;
  await user.save();

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

// ── Logout ─────────────────────────────────────────────────────────────────
const logout = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  // Clear refresh token from DB — invalidates all sessions
  user.refreshToken = null;
  await user.save();
};

// ── Helper: remove sensitive fields before sending to client ───────────────
const sanitizeUser = (user) => ({
  id: user._id,
  fullName: user.fullName,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
});

module.exports = { register, login, refreshAccessToken, logout };
