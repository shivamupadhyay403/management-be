const School = require('../models/school.model');

const Student = require('../models/student.model');

const Teacher = require('../models/teacher.model');

const Class = require('../models/class.model');

const Attendance = require('../models/attendance.model');

const AppError = require('../utils/AppError');

const User = require('../models/user.model');

const getSchoolProfile = async (schoolId) => {
  return School.findById(schoolId).lean();
};

const updateSchool = async (schoolId, payload) => {
  // Check school code
  if (payload.schoolCode) {
    const codeExists = await School.exists({
      code: payload.schoolCode,
      _id: { $ne: schoolId },
    });

    if (codeExists) {
      throw new AppError('School code already exists', 409);
    }
  }

  // Check school email
  if (payload.schoolEmail) {
    const emailExists = await School.exists({
      email: payload.schoolEmail,
      _id: { $ne: schoolId },
    });

    if (emailExists) {
      throw new AppError('School email already exists', 409);
    }
  }

  // Find current school admin
  const admin = await User.findOne({
    schoolId,
    role: 'school_admin',
  });

  if (!admin) {
    throw new AppError('School admin not found', 404);
  }

  // Check admin email uniqueness
  if (payload.adminEmail) {
    const adminEmailExists = await User.exists({
      email: payload.adminEmail,
      _id: { $ne: admin._id },
    });

    if (adminEmailExists) {
      throw new AppError('Admin email already exists', 409);
    }
  }

  // Update school
  const school = await School.findByIdAndUpdate(
    schoolId,
    {
      name: payload.schoolName,
      code: payload.schoolCode,
      email: payload.schoolEmail,
      phone: payload.phone,
      address: payload.address,
      status: payload.status,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!school) {
    throw new AppError('School not found', 404);
  }

  // Update admin
  await User.findByIdAndUpdate(
    admin._id,
    {
      name: payload.adminName,
      email: payload.adminEmail,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  return school;
};

module.exports = {
  updateSchool,
};
const getSchoolStats = async (schoolId) => {
  const [students, teachers, classes, attendanceToday] = await Promise.all([
    Student.countDocuments({
      schoolId,
    }),

    Teacher.countDocuments({
      schoolId,
    }),

    Class.countDocuments({
      schoolId,
    }),

    Attendance.countDocuments({
      schoolId,
    }),
  ]);

  return {
    students,
    teachers,
    classes,
    attendanceToday,
  };
};

module.exports = {
  getSchoolProfile,
  updateSchool,
  getSchoolStats,
};
