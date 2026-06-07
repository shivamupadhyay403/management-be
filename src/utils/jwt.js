const jwt = require('jsonwebtoken');

exports.generateToken = (payload) => {
  return jwt.sign(payload, process.env.TOKEN_SECRET, {
    expiresIn: '7d',
  });
};

exports.verifyToken = (token) => {
  return jwt.verify(token, process.env.TOKEN_SECRET);
};
