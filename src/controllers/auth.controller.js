const authService = require('../services/auth.service');
const successHandler = require('../handlers/success.handler');

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
    const result = await authService.login(req.body);

    return successHandler(res, result, 200, 'Login successful');
  } catch (err) {
    next(err);
  }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const result = await authService.refreshToken(req.body.refreshToken);

    return successHandler(res, result, 200, 'Token refreshed successfully');
  } catch (err) {
    next(err);
  }
};

exports.logout = async (req, res, next) => {
  try {
    await authService.logout(req.body.refreshToken);

    return successHandler(res, null, 200, 'Logged out successfully');
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
    await authService.changePassword(req.user.id, req.body.oldPassword, req.body.newPassword);

    return successHandler(res, null, 200, 'Password updated successfully');
  } catch (err) {
    next(err);
  }
};
