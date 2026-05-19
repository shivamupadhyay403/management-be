// utils/AppError.js
class AppError extends Error {
  constructor(message, statusCode, data = null) {
    super(message);
    this.statusCode = statusCode;
    this.data = data;
    this.isOperational = true; // distinguishes known vs unknown errors
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;