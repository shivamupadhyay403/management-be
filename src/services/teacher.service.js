const Teacher = require('../models/teacher.model');
const AppError = require('../utils/appError');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
function generateTemporaryPassword(length = 12) {
  return crypto
    .randomBytes(length)
    .toString('base64')
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(0, length);
}
exports.createTeacher = async (schoolId, payload) => {
  const existingTeacher = await Teacher.findOne({
    schoolId,
    $or: [{ email: payload.email }, { employeeId: payload.employeeId }],
  });

  if (existingTeacher) {
    if (existingTeacher.email === payload.email) {
      throw new AppError('Teacher with this email already exists', 409);
    }

    if (existingTeacher.employeeId === payload.employeeId) {
      throw new AppError('Teacher with this employee ID already exists', 409);
    }
  }
  // Generate temporary password
  const temporaryPassword = generateTemporaryPassword();

  // Hash password
  const hashedPassword = await bcrypt.hash(temporaryPassword, 10);
  const teacher = await Teacher.create({
    ...payload,
    schoolId,
    password: hashedPassword,
    passwordChanged: false,
  });
  const { password, ...response } = teacher.toObject();

  return response;
};
exports.getTeachers = async (schoolId, query) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;

  const filter = {
    schoolId,
  };

  if (query.subject) {
    filter.subject = query.subject;
  }

  if (query.status) {
    filter.status = query.status;
  }

  const teachers = await Teacher.find(filter)
    .select('-password')
    .skip((page - 1) * limit)
    .limit(limit)
    .sort('-createdAt');

  const total = await Teacher.countDocuments(filter);

  return {
    teachers,
    total,
    page,
    pages: Math.ceil(total / limit),
  };
};

exports.getTeacherById = async (id, schoolId) => {
  const teacher = await Teacher.findOne({
    _id: id,
    schoolId,
  }).select('-password');

  if (!teacher) {
    throw new AppError('Teacher not found', 404);
  }
  return teacher;
};

exports.updateTeacher = async (id, schoolId, payload) => {
  // Check only if employeeId is being updated
  if (payload.employeeId) {
    const exists = await Teacher.exists({
      employeeId: payload.employeeId,
      schoolId,
      _id: { $ne: id },
    });

    if (exists) {
      throw new AppError('Employee ID already exists', 409);
    }
  }

  const teacher = await Teacher.findOneAndUpdate(
    {
      _id: id,
      schoolId,
    },
    payload,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!teacher) {
    throw new AppError('Teacher not found', 404);
  }

  return teacher;
};

exports.deleteTeacher = async (id, schoolId) => {
  return Teacher.findOneAndDelete({
    _id: id,
    schoolId,
  });
};
