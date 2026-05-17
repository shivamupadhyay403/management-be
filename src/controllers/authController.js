const authService = require('../services/authService');
const {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
} = require('../validators/authValidator');

// ── Register ───────────────────────────────────────────────────────────────
const register = async (req, res, next) => {
  try {
    // 1. Validate request body with Joi
    const { error, value } = registerSchema.validate(req.body, {
      abortEarly: false, // return all errors, not just first
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
    const { user, accessToken, refreshToken } = await authService.register(value);

    // 3. Respond
    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        user,
        accessToken,
        refreshToken,
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m',
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── Login ──────────────────────────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    // 1. Validate request body with Joi
    const { error, value } = loginSchema.validate(req.body, {
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
    const { user, accessToken, refreshToken } = await authService.login(value);

    // 3. Respond
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user,
        accessToken,
        refreshToken,
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m',
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── Refresh Access Token ───────────────────────────────────────────────────
const refreshToken = async (req, res, next) => {
  try {
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
    const { accessToken, refreshToken: newRefreshToken } =
      await authService.refreshAccessToken(value.refreshToken);

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