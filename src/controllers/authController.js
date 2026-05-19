const authService = require('../services/authService');
const { refreshTokenSchema } = require('../validators/authValidator');
const successHandler = require('../handlers/successHandler');
const asyncHandler = require('express-async-handler');
// ── Register ───────────────────────────────────────────────────────────────
const register = asyncHandler(async (req, res, next) => {
  const user = await authService.register(value);
  successHandler(res, user, 'Account created successfully', 201);
});

// ── Login ──────────────────────────────────────────────────────────────────
const login = asyncHandler(async (req, res) => {
  const user = await authService.login(req.body);
  successHandler(res, user, 'User Logged In successfully', 200);
});

// ── Refresh Access Token ───────────────────────────────────────────────────
const refreshToken = async (req, res, next) => {
  try {
    l;
    // 1. Validate request body
    const { error, value } = refreshTokenSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      return res.status(422).json({
        success: false,
        message: 'Validation failed',
        errors: error.details.map((d) => ({
          field: d.context?.key,
          message: d.message,
        })),
      });
    }

    // 2. Call service
    const { accessToken, refreshToken: newRefreshToken } = await authService.refreshAccessToken(
      value.refreshToken
    );

    // 3. Respond
    return res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken,
        refreshToken: newRefreshToken,
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m',
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── Logout ─────────────────────────────────────────────────────────────────
const logout = async (req, res, next) => {
  try {
    // req.user is set by the protect middleware
    await authService.logout(req.user.id);

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (err) {
    next(err);
  }
};

// ── Get current user (me) ──────────────────────────────────────────────────
const getMe = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      data: {
        user: req.user,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, refreshToken, logout, getMe };
