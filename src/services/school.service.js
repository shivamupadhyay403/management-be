const School = require('../models/school.model');

const Student = require('../models/student.model');

const Teacher = require('../models/teacher.model');

const Class = require('../models/class.model');

const Attendance = require('../models/attendance.model');

const getSchoolProfile = async (schoolId) => {
  return School.findById(schoolId).lean();
};

const updateSchool = async (schoolId, payload) => {
  return School.findByIdAndUpdate(schoolId, payload, {
    new: true,
    runValidators: true,
  });
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
