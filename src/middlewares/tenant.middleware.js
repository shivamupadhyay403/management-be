module.exports = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
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
