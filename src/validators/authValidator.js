const Joi = require('joi');

// ── Register schema ────────────────────────────────────────────────────────
const registerSchema = Joi.object({
  fullName: Joi.string().min(2).max(50).required().messages({
    'string.empty': 'Full name is required',
    'string.min': 'Full name must be at least 2 characters',
    'string.max': 'Full name must not exceed 50 characters',
    'any.required': 'Full name is required',
  }),

  email: Joi.string().email().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),

  password: Joi.string()
    .min(6)
    .max(32)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 6 characters',
      'string.max': 'Password must not exceed 32 characters',
      'string.pattern.base':
        'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      'any.required': 'Password is required',
    }),

  confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
    'any.only': 'Passwords do not match',
    'any.required': 'Please confirm your password',
  }),

  role: Joi.string().valid('admin', 'teacher', 'student').default('student').messages({
    'any.only': 'Role must be one of: admin, teacher, student',
  }),
});

// ── Login schema ───────────────────────────────────────────────────────────
const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),

  password: Joi.string().required().messages({
    'string.empty': 'Password is required',
    'any.required': 'Password is required',
  }),
});

// ── Refresh token schema ───────────────────────────────────────────────────
const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    'string.empty': 'Refresh token is required',
    'any.required': 'Refresh token is required',
  }),
});

module.exports = { registerSchema, loginSchema, refreshTokenSchema };