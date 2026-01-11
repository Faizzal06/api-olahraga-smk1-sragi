const express = require('express');
const router = express.Router();
const { announcementController } = require('../controllers');
const { auth, isTeacher, isStudent, isTeacherOrAdmin } = require('../middleware');
const validate = require('../middleware/validate');
const { announcementValidators } = require('../utils/validators');

/**
 * @route   POST /api/announcements
 * @desc    Create announcement
 * @access  Teacher
 */
router.post('/', auth, isTeacher, announcementValidators.create, validate, announcementController.createAnnouncement);

/**
 * @route   GET /api/announcements
 * @desc    Get all announcements
 * @access  Authenticated
 */
router.get('/', auth, announcementController.getAllAnnouncements);

/**
 * @route   GET /api/announcements/for-student
 * @desc    Get announcements for current student
 * @access  Student
 */
router.get('/for-student', auth, isStudent, announcementController.getAnnouncementsForStudent);

/**
 * @route   GET /api/announcements/:id
 * @desc    Get announcement by ID
 * @access  Authenticated
 */
router.get('/:id', auth, announcementValidators.getById, validate, announcementController.getAnnouncementById);

/**
 * @route   POST /api/announcements/:id/read
 * @desc    Mark announcement as read
 * @access  Authenticated
 */
router.post('/:id/read', auth, announcementValidators.getById, validate, announcementController.markAsRead);

/**
 * @route   PUT /api/announcements/:id
 * @desc    Update announcement
 * @access  Teacher (author only)
 */
router.put('/:id', auth, isTeacher, announcementValidators.update, validate, announcementController.updateAnnouncement);

/**
 * @route   DELETE /api/announcements/:id
 * @desc    Delete announcement
 * @access  Teacher (author only), Admin
 */
router.delete('/:id', auth, isTeacherOrAdmin, announcementValidators.getById, validate, announcementController.deleteAnnouncement);

module.exports = router;
