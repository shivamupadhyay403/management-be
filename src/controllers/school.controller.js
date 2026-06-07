const schoolService = require('../services/school.service');

const getProfile = async (req, res, next) => {
  try {
    const school = await schoolService.getSchoolProfile(req.schoolId);

    res.json({
      success: true,
      data: school,
    });
  } catch (err) {
    next(err);
  }
};

const updateSchool = async (req, res, next) => {
  try {
    const school = await schoolService.updateSchool(req.schoolId, req.body);

    res.json({
      success: true,
      data: school,
    });
  } catch (err) {
    next(err);
  }
};

const getStats = async (req, res, next) => {
  try {
    const stats = await schoolService.getSchoolStats(req.schoolId);

    res.json({
      success: true,
      data: stats,
    });
  } catch (err) {
    next(err);
  }
};
module.exports = {
  getProfile,
  updateSchool,
  getStats,
};
