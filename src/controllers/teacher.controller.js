const teacherService = require('../services/teacher.service');
const successHandler=require("../handlers/success.handler")
exports.createTeacher = async (req, res, next) => {
  try {
    const result = await teacherService.createTeacher(req.schoolId, req.body);
    return successHandler(res, result, 201, 'Teacher Added successfully');
  } catch (err) {
    next(err);
  }
};

exports.getTeachers = async (req, res, next) => {
  try {
    const result = await teacherService.getTeachers(req.schoolId, req.query);
    return successHandler(res, result, 200, 'Teachers Fetched successfully');
  } catch (err) {
    next(err);
  }
};

exports.getTeacher = async (req, res, next) => {
  try {
    const result = await teacherService.getTeacherById(req.params.id, req.schoolId);
    return successHandler(res, result, 200, 'Teacher Fetched successfully');
  } catch (err) {
    next(err);
  }
};


exports.updateTeacher = async (req, res, next) => {
  try {
    const teacher = await teacherService.updateTeacher(req.params.id, req.schoolId, req.body);

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found',
      });
    }

    res.json({
      success: true,
      data: teacher,
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteTeacher = async (req, res, next) => {
  try {
    const teacher = await teacherService.deleteTeacher(req.params.id, req.schoolId);

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found',
      });
    }

    res.json({
      success: true,
      message: 'Teacher deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};
