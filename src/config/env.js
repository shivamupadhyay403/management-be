require('dotenv').config();

module.exports = {
  ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  ACCESS_EXPIRY: process.env.JWT_ACCESS_EXPIRY || '15m',
  REFRESH_EXPIRY: process.env.JWT_REFRESH_EXPIRY || '7d',
};