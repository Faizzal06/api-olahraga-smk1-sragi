const express = require('express');
const router = express.Router();
const { dashboardController } = require('../controllers');
const { auth, isStudent, isTeacher, isAdmin } = require('../middleware');

/**
 * @route   GET /api/dashboard/student
 * @desc    Get student dashboard data
 * @access  Student
 */
router.get('/student', auth, isStudent, dashboardController.getStudentDashboard);

/**
 * @route   GET /api/dashboard/teacher
 * @desc    Get teacher dashboard data
 * @access  Teacher
 */
router.get('/teacher', auth, isTeacher, dashboardController.getTeacherDashboard);

/**
 * @route   GET /api/dashboard/admin
 * @desc    Get admin dashboard data
 * @access  Admin
 */
router.get('/admin', auth, isAdmin, dashboardController.getAdminDashboard);

module.exports = router;
