const { rateLimit, ipKeyGenerator } = require('express-rate-limit');

// Strict limiter for login — combine IP + email so one IP can't
// brute-force many accounts, and one account can't be hammered from many IPs
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,      // 15 min window
  max: 5,                         // 5 attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => `${ipKeyGenerator(req.ip)}:${req.body?.email || 'unknown'}`,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many login attempts. Please try again later.',
    });
  },
});

// Looser limiter for refresh — legit clients refresh often
const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

// Registration — prevent automated account creation spam
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,      // 1 hour
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

// Password change — sensitive action, keep it tight.
// Runs after `auth` middleware in the route, so req.user is available —
// keying on user id (not IP) means one user's attempts can't be diluted
// or amplified by others sharing the same IP/NAT.
const changePasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user.id,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many password change attempts. Please try again later.',
    });
  },
});

// Logout limiter
const logoutLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  loginLimiter,
  refreshLimiter,
  registerLimiter,
  changePasswordLimiter,
  logoutLimiter,
};