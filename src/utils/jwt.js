// utils/jwt.js

const jwt = require('jsonwebtoken');
const AppError = require('./AppError');
const {
  ACCESS_SECRET,
  REFRESH_SECRET,
  ACCESS_EXPIRY,
  REFRESH_EXPIRY,
  SHORT_TIME_REFRESH_EXPIRY,
} = require('../config/env');
const generateAccessToken = (payload) => {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRY });
};

/**
 * Long-lived token stored in an httpOnly cookie.
 * Minimal payload — only userId to keep it lean.
 * jwtid (jti) allows per-token revocation if you store it in DB/Redis.
 */
const generateRefreshToken = (userId, jti, rememberMe=true) =>
  jwt.sign({ userId, jti }, REFRESH_SECRET, {
    expiresIn: rememberMe ? SHORT_TIME_REFRESH_EXPIRY : REFRESH_EXPIRY,
  });

// ─── Verify ───────────────────────────────────────────────────────────────────

const verifyAccessToken = (token) => {
  try {
    console.log(ACCESS_SECRET);
    return jwt.verify(token, ACCESS_SECRET);
  } catch (err) {
    throw new AppError('Invalid or expired access token', 401);
  }
};

const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, REFRESH_SECRET);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new AppError('Refresh token expired, please log in again', 401);
    }
    throw new AppError('Invalid refresh token', 401);
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
