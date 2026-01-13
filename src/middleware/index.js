const { auth, optionalAuth } = require('./auth');
const {
    authorize,
    isStudent,
    isTeacher,
    isAdmin,
    isTeacherOrAdmin,
    isAuthenticated,
    isOwner,
    isClassTeacher
} = require('./roleAuth');
const {
    errorHandler,
    notFound,
    asyncHandler,
    AppError
} = require('./errorHandler');
const validate = require('./validate');
const { logger, simpleLogger } = require('./logger');
const { handleUpload, uploadSingleImage } = require('./fileUpload');

module.exports = {
    auth,
    optionalAuth,
    authorize,
    isStudent,
    isTeacher,
    isAdmin,
    isTeacherOrAdmin,
    isAuthenticated,
    isOwner,
    isClassTeacher,
    errorHandler,
    notFound,
    asyncHandler,
    AppError,
    validate,
    logger,
    simpleLogger,
    handleUpload,
    uploadSingleImage
};
