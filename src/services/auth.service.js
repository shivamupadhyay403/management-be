const School = require('../models/school.model');
const User = require('../models/user.model');
const Subscription = require('../models/subscription.model');
const { hashPassword, comparePassword } = require('../utils/bcrypt');
const AppError = require('../utils/AppError');
const { generateToken } = require('../utils/jwt');

exports.registerSchool = async (payload) => {
  const { schoolName, schoolEmail, schoolCode, adminName, adminEmail, password } = payload;

  const schoolExists = await School.findOne({
    code: schoolCode,
  });

  if (schoolExists) {
    throw new AppError('School code already exists');
  }

  const userExists = await User.findOne({
    email: adminEmail,
  });

  if (userExists) {
    throw new AppError('Admin Email already exists');
  }

  const school = await School.create({
    name: schoolName,
    code: schoolCode,
    email: schoolEmail,
  });

  const hashedPassword = await hashPassword(password);

  const admin = await User.create({
    schoolId: school._id,
    name: adminName,
    email: adminEmail,
    password: hashedPassword,
    role: 'school_admin',
  });

  await Subscription.create({
    schoolId: school._id,
    plan: 'free',
    status: 'active',
  });

  const token = generateToken({
    userId: admin._id,
    schoolId: school._id,
    role: admin.role,
  });

  return {
    token,
    school,
    admin,
  };
};
