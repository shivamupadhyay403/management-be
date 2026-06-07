const Joi = require('joi');

exports.createTeacherSchema = Joi.object({
  employeeId: Joi.string().required().messages({
    'string.empty': 'Employee ID is required',
    'any.required': 'Employee ID is required',
  }),

  firstName: Joi.string().required().messages({
    'string.empty': 'First name is required',
    'any.required': 'First name is required',
  }),

  lastName: Joi.string().required().messages({
    'string.empty': 'Last name is required',
    'any.required': 'Last name is required',
  }),

  email: Joi.string().email().required().messages({
    'string.email': 'Please enter a valid email address',
    'string.empty': 'Email is required',
    'any.required': 'Email is required',
  }),

  phone: Joi.string().required().messages({
    'string.empty': 'Phone number is required',
    'any.required': 'Phone number is required',
  }),

  gender: Joi.string().valid('MALE', 'FEMALE', 'OTHER').messages({
    'any.only': 'Gender must be MALE, FEMALE, or OTHER',
  }),

  qualification: Joi.string().allow('').messages({
    'string.base': 'Qualification must be a string',
  }),

  experience: Joi.number().messages({
    'number.base': 'Experience must be a number',
  }),

  subject: Joi.string().allow('').messages({
    'string.base': 'Subject must be a string',
  }),

  joiningDate: Joi.date().messages({
    'date.base': 'Joining date must be a valid date',
  }),

  salary: Joi.number().messages({
    'number.base': 'Salary must be a number',
  }),

  address: Joi.string().allow('').messages({
    'string.base': 'Address must be a string',
  }),
});

exports.updateTeacherSchema = Joi.object({
  employeeId: Joi.string().messages({
    'string.empty': 'Employee ID cannot be empty',
  }),

  firstName: Joi.string().messages({
    'string.empty': 'First name cannot be empty',
  }),

  lastName: Joi.string().messages({
    'string.empty': 'Last name cannot be empty',
  }),

  email: Joi.string().email().messages({
    'string.email': 'Please enter a valid email address',
  }),

  phone: Joi.string().messages({
    'string.empty': 'Phone number cannot be empty',
  }),

  gender: Joi.string().valid('MALE', 'FEMALE', 'OTHER').messages({
    'any.only': 'Gender must be MALE, FEMALE, or OTHER',
  }),

  qualification: Joi.string().messages({
    'string.empty': 'Qualification cannot be empty',
  }),

  experience: Joi.number().messages({
    'number.base': 'Experience must be a number',
  }),

  subject: Joi.string().messages({
    'string.empty': 'Subject cannot be empty',
  }),

  joiningDate: Joi.date().messages({
    'date.base': 'Joining date must be a valid date',
  }),

  salary: Joi.number().messages({
    'number.base': 'Salary must be a number',
  }),

  address: Joi.string().messages({
    'string.empty': 'Address cannot be empty',
  }),

  status: Joi.string().valid('ACTIVE', 'INACTIVE').messages({
    'any.only': 'Status must be ACTIVE or INACTIVE',
  }),
});
