const express = require('express');
const router = express.Router();
const { exportController } = require('../controllers');
const { auth, isTeacherOrAdmin } = require('../middleware');
const validate = require('../middleware/validate');
const { exportValidators } = require('../utils/validators');

/**
 * @route   GET /api/export/activities
 * @desc    Export activities to Excel
 * @access  Teacher, Admin
 */
router.get('/activities', auth, isTeacherOrAdmin, exportValidators.activities, validate, exportController.exportActivities);

/**
 * @route   GET /api/export/students
 * @desc    Export students data to Excel
 * @access  Teacher, Admin
 */
router.get('/students', auth, isTeacherOrAdmin, exportController.exportStudents);

/**
 * @route   GET /api/export/class-report/:classId
 * @desc    Export class activity report to Excel
 * @access  Teacher, Admin
 */
router.get('/class-report/:classId', auth, isTeacherOrAdmin, exportController.exportClassReport);

module.exports = router;
