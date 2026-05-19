// middleware/errorMiddleware.js
const AppError = require('../utils/AppError');

const errorMiddleware = (err, req, res, next) => {
  // Normalize unknown errors into a safe shape
  let error = err;

  if (!(err instanceof AppError)) {
    // Mongoose validation error
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      error = new AppError(messages.join(', '), 400);
    }
    // Mongoose duplicate key
    else if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      error = new AppError(`${field} already exists`, 409);
    }
    // JWT errors
    else if (err.name === 'JsonWebTokenError') {
      error = new AppError('Invalid token', 401);
    }
    else if (err.name === 'TokenExpiredError') {
      error = new AppError('Token expired', 401);
    }
    // Truly unexpected — don't leak internals
    else {
      console.error('UNHANDLED ERROR:', err); // log the real error
      error = new AppError('Internal Server Error', 500);
    }
  }

  res.status(error.statusCode).json({
    success: false,
    message: error.message,
    ...(error.data && { data: error.data }),
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
};

module.exports = errorMiddleware;