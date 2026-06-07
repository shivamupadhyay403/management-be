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
  const schoolEmailExists = await School.findOne({
    email: schoolEmail,
  });
  if (schoolEmailExists) {
    throw new AppError('School Email already exists');
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
exports.login = async (payload) => {
  const { email, password } = payload;

  const user = await User.findOne({ email }).select('+password').populate('schoolId');

  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }
  const token = generateToken({
    userId: user._id,
    schoolId: user.schoolId?._id,
    role: user.role,
  });

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      schoolId: user.schoolId?._id,
    },
  };
};
exports.changePassword = async (userId, oldPassword, newPassword) => {
  const user = await User.findById(userId).select('+password');

  if (!user) {
    throw new AppError('User not found', 404);
  }

  const isMatch = await comparePassword(oldPassword, user.password);

  if (!isMatch) {
    throw new AppError('Old password is incorrect', 400);
  }

  user.password = await hashPassword(newPassword);

  await user.save();

  return true;
};
