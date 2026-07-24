const { verifyAccessToken } = require('../utils/jwt');

module.exports = (req, res, next) => {
  try {
    const bearerToken = req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.split(' ')[1]
      : null;

    const cookieToken = req.cookies?.edu_excel_acc_token;

    const token = bearerToken || cookieToken;
    if (!token) {
      return res.status(401).json({
        message: 'Unauthorized',
      });
    }

    req.user = verifyAccessToken(token);

    next();
  } catch (err) {
    return res.status(401).json({
      message: 'Invalid Token',
    });
  }
};
