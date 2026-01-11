const express = require('express');
const router = express.Router();
const { activityController } = require('../controllers');
const { auth, isStudent, isTeacher, isTeacherOrAdmin } = require('../middleware');
const validate = require('../middleware/validate');
const { activityValidators } = require('../utils/validators');

/**
 * @route   POST /api/activities
 * @desc    Create activity report
 * @access  Student
 */
router.post('/', auth, isStudent, activityValidators.create, validate, activityController.createActivity);

/**
 * @route   GET /api/activities
 * @desc    Get all activities (filterable)
 * @access  Authenticated
 */
router.get('/', auth, activityController.getAllActivities);

/**
 * @route   GET /api/activities/pending
 * @desc    Get pending activities for verification
 * @access  Teacher, Admin
 */
router.get('/pending', auth, isTeacherOrAdmin, activityController.getPendingActivities);

/**
 * @route   GET /api/activities/student/:studentId
 * @desc    Get activities by student
 * @access  Authenticated
 */
router.get('/student/:studentId', auth, activityValidators.getByStudent, validate, activityController.getActivitiesByStudent);

/**
 * @route   GET /api/activities/class/:classId
 * @desc    Get activities by class
 * @access  Teacher, Admin
 */
router.get('/class/:classId', auth, isTeacherOrAdmin, activityValidators.getByClass, validate, activityController.getActivitiesByClass);

/**
 * @route   GET /api/activities/:id
 * @desc    Get activity by ID
 * @access  Authenticated
 */
router.get('/:id', auth, activityValidators.getById, validate, activityController.getActivityById);

/**
 * @route   PUT /api/activities/:id/verify
 * @desc    Verify activity (accept/reject)
 * @access  Teacher
 */
router.put('/:id/verify', auth, isTeacher, activityValidators.verify, validate, activityController.verifyActivity);

/**
 * @route   DELETE /api/activities/:id
 * @desc    Delete activity
 * @access  Student (own, pending only), Admin
 */
router.delete('/:id', auth, activityValidators.getById, validate, activityController.deleteActivity);

module.exports = router;
