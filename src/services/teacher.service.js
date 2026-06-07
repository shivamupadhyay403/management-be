const Teacher = require('../models/teacher.model');
const AppError = require('../utils/appError');

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
  const teacher = await Teacher.create({
    ...payload,
    schoolId,
  });
  return teacher;
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
  });

  if (!teacher) {
    throw new AppError('Teacher not found', 404);
  }
  return teacher;
};

exports.updateTeacher = async (id, schoolId, payload) => {
  return Teacher.findOneAndUpdate(
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
};

exports.deleteTeacher = async (id, schoolId) => {
  return Teacher.findOneAndDelete({
    _id: id,
    schoolId,
  });
};
