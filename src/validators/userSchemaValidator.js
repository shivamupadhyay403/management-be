const Joi = require("joi");

const registerSchema = Joi.object({
  username: Joi.string().min(3).max(10).required().messages({
    "string.empty": "Username is required",
    "any.required": "Username is required",
  }),

  firstname: Joi.string().min(3).max(10).required().messages({
    "string.empty": "Firstname is required",
    "any.required": "Firstname is required",
  }),

  lastname: Joi.string().min(3).max(10).required().messages({
    "string.empty": "Lastname is required",
    "any.required": "Lastname is required",
  }),

  gender: Joi.string().valid("M", "F").required().messages({
    "any.only": "Gender must be M or F",
    "any.required": "Gender is required",
  }),

  email: Joi.string().email().required().messages({
    "string.email": "Invalid email",
    "any.required": "Email is required",
  }),

  password: Joi.string()
    .min(8)
    .pattern(/^[a-zA-Z0-9@#$%^&*!]+$/)
    .required()
    .messages({
      "string.pattern.base": "Password contains invalid characters",
      "any.required": "Password is required",
    }),

  confirmPassword: Joi.string().valid(Joi.ref("password")).required().messages({
    "any.only": "Passwords do not match",
    "any.required": "Confirm password is required",
  }),
});

const loginSchema = Joi.object({
  email: Joi.string()
    .min(3)
    .required()
    .custom((value, helpers) => {
      const isEmail = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value);

      const isUsername = /^[a-zA-Z0-9_]{3,30}$/.test(value);

      if (!isEmail && !isUsername) {
        return helpers.message(
          "Enter a valid email or username (letters, numbers, underscores)",
        );
      }

      return value;
    })
    .messages({
      "string.empty": "Username or email is required",
      "string.min": "Must be at least 3 characters",
      "any.required": "Username or email is required",
    }),

  password: Joi.string()
    .min(8)
    .pattern(/^[a-zA-Z0-9@#$%^&*!]+$/)
    .required()
    .messages({
      "string.pattern.base": "Password contains invalid characters",
      "string.min": "Password must be at least 8 characters",
      "any.required": "Password is required",
    }),
});
module.exports = {
  registerSchema,
  loginSchema,
};
