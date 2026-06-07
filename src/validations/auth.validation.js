const Joi = require('joi');

exports.registerSchoolSchema = Joi.object({
  schoolName: Joi.string().required().messages({
    'string.empty': 'School name is required',
    'any.required': 'School name is required',
  }),

  schoolEmail: Joi.string().email().required().messages({
    'string.email': 'Please enter a valid school email address',
    'string.empty': 'School email is required',
    'any.required': 'School email is required',
  }),

  schoolCode: Joi.string().required().messages({
    'string.empty': 'School code is required',
    'any.required': 'School code is required',
  }),

  adminName: Joi.string().required().messages({
    'string.empty': 'Admin name is required',
    'any.required': 'Admin name is required',
  }),

  adminEmail: Joi.string().email().required().messages({
    'string.email': 'Please enter a valid admin email address',
    'string.empty': 'Admin email is required',
    'any.required': 'Admin email is required',
  }),

  password: Joi.string().min(6).required().messages({
    'string.empty': 'Password is required',
    'string.min': 'Password must be at least 6 characters long',
    'any.required': 'Password is required',
  }),
});

exports.loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please enter a valid email address',
    'string.empty': 'Email is required',
    'any.required': 'Email is required',
  }),

  password: Joi.string().required().messages({
    'string.empty': 'Password is required',
    'any.required': 'Password is required',
  }),
});

exports.changePasswordSchema = Joi.object({
  oldPassword: Joi.string().required().messages({
    'string.empty': 'Old password is required',
    'any.required': 'Old password is required',
  }),

  newPassword: Joi.string().min(6).required().messages({
    'string.empty': 'New password is required',
    'string.min': 'New password must be at least 6 characters long',
    'any.required': 'New password is required',
  }),
});