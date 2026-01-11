const { validationResult } = require('express-validator');

/**
 * Middleware untuk menghandle hasil validasi dari express-validator
 */
const validate = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(err => ({
            field: err.path,
            message: err.msg
        }));

        return res.status(400).json({
            success: false,
            message: 'Validasi gagal',
            error: 'VALIDATION_ERROR',
            details: errorMessages
        });
    }

    next();
};

module.exports = validate;
