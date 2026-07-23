// src/utils/createSuperAdmin.js

const { SUPER_ADMIN_PASSWORD, SUPER_ADMIN_EMAIL } = require('../config/env');
const User = require('../models/user.model');
const { hashPassword } = require('../utils/bcrypt');

async function createSuperAdmin() {
  const exists = await User.findOne({
    email: SUPER_ADMIN_EMAIL,
  });

  if (exists) return;

  await User.create({
    name: 'Platform Owner',
    email: SUPER_ADMIN_EMAIL,
    password: await hashPassword(SUPER_ADMIN_PASSWORD),
    role: 'super_admin',
  });

  console.log('Super admin created');
}

module.exports = createSuperAdmin;
