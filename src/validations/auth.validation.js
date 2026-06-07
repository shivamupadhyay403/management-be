const Joi = require('joi');

exports.registerSchoolSchema = Joi.object({
  schoolName: Joi.string().required(),
  schoolEmail: Joi.string().email().required(),
  schoolCode: Joi.string().required(),
  adminName: Joi.string().required(),
  adminEmail: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

exports.loginSchema = Joi.object({
  email: Joi.string().email().required(),

  password: Joi.string().required(),
});

exports.changePasswordSchema = Joi.object({
  oldPassword: Joi.string().required(),

  newPassword: Joi.string().min(6).required(),
});
