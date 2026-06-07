const successHandler = (
  res,
  data = null,
  statusCode = 200,
  message = 'Success'
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

module.exports = successHandler;