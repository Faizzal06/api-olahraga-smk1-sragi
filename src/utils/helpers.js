/**
 * Helper utilities untuk aplikasi
 */

/**
 * Membuat response sukses yang konsisten
 */
const successResponse = (res, statusCode, message, data = null) => {
    const response = {
        success: true,
        message
    };

    if (data !== null) {
        response.data = data;
    }

    return res.status(statusCode).json(response);
};

/**
 * Membuat response error yang konsisten
 */
const errorResponse = (res, statusCode, message, errorCode = 'ERROR', details = null) => {
    const response = {
        success: false,
        message,
        error: errorCode
    };

    if (details !== null) {
        response.details = details;
    }

    return res.status(statusCode).json(response);
};

/**
 * Helper untuk pagination
 */
const getPagination = (query) => {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 20;
    const skip = (page - 1) * limit;

    return { page, limit, skip };
};

/**
 * Membuat response dengan pagination
 */
const paginatedResponse = (res, data, total, page, limit) => {
    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
        success: true,
        data,
        pagination: {
            currentPage: page,
            totalPages,
            totalItems: total,
            itemsPerPage: limit,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
        }
    });
};

/**
 * Helper untuk mendapatkan range tanggal
 */
const getDateRange = (startDate, endDate) => {
    const start = startDate ? new Date(startDate) : new Date();
    start.setHours(0, 0, 0, 0);

    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);

    return { start, end };
};

/**
 * Helper untuk mendapatkan awal dan akhir hari ini
 */
const getTodayRange = () => {
    const today = new Date();

    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    return { startOfDay, endOfDay };
};

/**
 * Helper untuk mendapatkan range minggu ini
 */
const getWeekRange = () => {
    const today = new Date();

    // Mendapatkan hari Senin minggu ini
    const startOfWeek = new Date(today);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);

    // Mendapatkan hari Minggu minggu ini
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    return { startOfWeek, endOfWeek };
};

/**
 * Helper untuk mendapatkan range bulan ini
 */
const getMonthRange = () => {
    const today = new Date();

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);

    return { startOfMonth, endOfMonth };
};

/**
 * Capitalize first letter
 */
const capitalizeFirst = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Sanitize filename untuk export
 */
const sanitizeFilename = (filename) => {
    return filename.replace(/[^a-z0-9]/gi, '_').toLowerCase();
};

module.exports = {
    successResponse,
    errorResponse,
    getPagination,
    paginatedResponse,
    getDateRange,
    getTodayRange,
    getWeekRange,
    getMonthRange,
    capitalizeFirst,
    sanitizeFilename
};
