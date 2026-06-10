const authService    = require('../services/auth.service');
const successHandler = require('../handlers/success.handler');

// ─── Cookie helpers ───────────────────────────────────────────────────────────

const isProd = process.env.NODE_ENV === 'production';

const setAuthCookies = (res, accessToken, refreshToken) => {
  res.cookie('edu_excel_acc_token', accessToken, {
    httpOnly: true,
    secure:   isProd,
    sameSite: 'strict',
    maxAge:   15 * 60 * 1000,           // 15 minutes
  });

  res.cookie('edu_excel_ref_token', refreshToken, {
    httpOnly: true,
    secure:   isProd,
    sameSite: 'strict',
    maxAge:   7 * 24 * 60 * 60 * 1000, // 7 days
    path:     '/api/auth/refresh',      // cookie only sent to this endpoint
  });
};

const clearAuthCookies = (res) => {
  res.clearCookie('edu_excel_acc_token');
  res.clearCookie('edu_excel_ref_token', { path: '/api/auth/refresh' });
};

// ─── Controllers ─────────────────────────────────────────────────────────────

exports.registerSchool = async (req, res, next) => {
  try {
    const result = await authService.registerSchool(req.body);
    return successHandler(res, result, 201, 'School registered successfully');
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const meta = { userAgent: req.headers['user-agent'], ipAddress: req.ip };
    const { accessToken, refreshToken, expiresAt, user } =
      await authService.login(req.body, meta);

    setAuthCookies(res, accessToken, refreshToken);

    // Body carries only non-sensitive session info for Redux in-memory store
    return successHandler(res, { user, expiresAt }, 200, 'Login successful');
  } catch (err) {
    next(err);
  }
};

exports.refresh = async (req, res, next) => {
  try {
    const meta = { userAgent: req.headers['user-agent'], ipAddress: req.ip };
    const { accessToken, refreshToken, expiresAt, user } =
      await authService.refresh(req.cookies?.edu_excel_ref_token, meta);

    setAuthCookies(res, accessToken, refreshToken);

    return successHandler(res, { user, expiresAt }, 200, 'Token refreshed successfully');
  } catch (err) {
    clearAuthCookies(res);
    next(err);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const logoutAll = req.query.all === 'true';
    await authService.logout(req.cookies?.edu_excel_ref_token, logoutAll);

    clearAuthCookies(res);

    const message = logoutAll ? 'Logged out from all devices' : 'Logged out successfully';
    return successHandler(res, null, 200, message);
  } catch (err) {
    next(err);
  }
};

exports.me = async (req, res, next) => {
  try {
    return successHandler(res, req.user, 200, 'User fetched successfully');
  } catch (err) {
    next(err);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    await authService.changePassword(
      req.user.id,
      req.body.oldPassword,
      req.body.newPassword,
    );

    // Revokes all refresh tokens in service — clear cookies here too
    clearAuthCookies(res);

    return successHandler(res, null, 200, 'Password updated successfully. Please log in again.');
  } catch (err) {
    next(err);
  }
};