module.exports = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    if (req.user.role === 'super_admin') {
      return next();
    }

    if (!req.user.schoolId) {
      return res.status(403).json({
        success: false,
        message: 'School ID not found',
      });
    }

    req.schoolId = req.user.schoolId;

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Tenant middleware error',
    });
  }
};