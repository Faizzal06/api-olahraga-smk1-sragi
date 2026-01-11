/**
 * Global error handler middleware
 */

const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    // Default error
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Terjadi kesalahan pada server';
    let error = err.code || 'SERVER_ERROR';

    // Mongoose Validation Error
    if (err.name === 'ValidationError') {
        statusCode = 400;
        const messages = Object.values(err.errors).map(e => e.message);
        message = messages.join('. ');
        error = 'VALIDATION_ERROR';
    }

    // Mongoose Duplicate Key Error
    if (err.code === 11000) {
        statusCode = 400;
        const field = Object.keys(err.keyValue)[0];
        message = `${field} sudah digunakan. Silakan gunakan yang lain.`;
        error = 'DUPLICATE_KEY';
    }

    // Mongoose Cast Error (Invalid ObjectId)
    if (err.name === 'CastError') {
        statusCode = 400;
        message = `Invalid ${err.path}: ${err.value}`;
        error = 'INVALID_ID';
    }

    // JWT Error
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Token tidak valid.';
        error = 'INVALID_TOKEN';
    }

    // JWT Expired Error
    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token sudah kadaluarsa. Silakan login ulang.';
        error = 'TOKEN_EXPIRED';
    }

    // Custom Application Error
    if (err.isOperational) {
        return res.status(statusCode).json({
            success: false,
            message: message,
            error: error
        });
    }

    // Production vs Development error response
    if (process.env.NODE_ENV === 'production') {
        return res.status(statusCode).json({
            success: false,
            message: statusCode === 500 ? 'Terjadi kesalahan pada server' : message,
            error: error
        });
    }

    // Development - include stack trace
    return res.status(statusCode).json({
        success: false,
        message: message,
        error: error,
        stack: err.stack
    });
};

/**
 * Not Found handler - untuk route yang tidak ditemukan
 */
const notFound = (req, res, next) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} tidak ditemukan`,
        error: 'NOT_FOUND'
    });
};

/**
 * Async handler wrapper untuk menghindari try-catch berulang
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Custom Application Error class
 */
class AppError extends Error {
    constructor(message, statusCode, errorCode) {
        super(message);
        this.statusCode = statusCode;
        this.code = errorCode;
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = {
    errorHandler,
    notFound,
    asyncHandler,
    AppError
};
