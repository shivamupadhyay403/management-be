const Joi = require('joi');

const updateSchoolSchema = Joi.object({
  name: Joi.string().trim(),

  email: Joi.string().email(),

  phone: Joi.string(),

  address: Joi.string(),

  status: Joi.string().valid('active', 'inactive'),
});
module.exports = { updateSchoolSchema };
