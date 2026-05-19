const jwt = require('jsonwebtoken');
const {
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
  ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_IN,
} = require('../config/jwtConfig');

/**
 * Generate a short-lived access token
 * Payload: { id, email, role }
 */
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    ACCESS_TOKEN_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRES_IN }
  );
};

/**
 * Generate a long-lived refresh token
 * Payload: { id } — minimal data only
 */
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },
    REFRESH_TOKEN_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
  );
};

/**
 * Verify an access token — throws if invalid or expired
 */
const verifyAccessToken = (token) => {
  return jwt.verify(token, ACCESS_TOKEN_SECRET);
};

/**
 * Verify a refresh token — throws if invalid or expired
 */
const verifyRefreshToken = (token) => {
  return jwt.verify(token, REFRESH_TOKEN_SECRET);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};