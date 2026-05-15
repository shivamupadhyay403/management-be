const errorHandler = require('../handlers/errorHandler')

const validate = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body)

    if (error) {
        return errorHandler(res, null, error.details[0].message, 400)
    }

    next()
}

module.exports = validate