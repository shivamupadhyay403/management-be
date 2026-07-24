const jwt = require('jsonwebtoken');
const logger = require('../logger/logger');
const { ACCESS_SECRET, ACCESS_EXPIRY, REFRESH_SECRET, REFRESH_EXPIRY } = require('./env');

const generateAccessToken = async (data, rememberMe = false) => {
  try {
    const token = jwt.sign(data, ACCESS_SECRET, {
      expiresIn: rememberMe ? ACCESS_EXPIRY : '1d',
    });

    return token;
  } catch (err) {
    logger.error('Error generating access token', err);
    throw err;
  }
};
const generateRefreshToken = async (data, rememberMe=true) => {
  try {
    const token = jwt.sign(data, REFRESH_SECRET, {
      expiresIn: rememberMe ? '1d' : REFRESH_EXPIRY,
    });

    return token;
  } catch (err) {
    logger.error('Error generating refresh token', err);
    throw err;
  }
};

module.exports = { generateAccessToken, generateRefreshToken };
