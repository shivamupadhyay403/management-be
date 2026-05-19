const errorHandler = (res, data, message = 'Error', statusCode = 200) => {
    return res.status(statusCode).json({
        success: false,
        message,
        data,
    })
}

module.exports = errorHandler
