const express = require('express');
const router = express.Router();
const { classController } = require('../controllers');
const { auth, isAdmin, isTeacherOrAdmin } = require('../middleware');
const validate = require('../middleware/validate');
const { classValidators } = require('../utils/validators');

/**
 * @route   GET /api/classes
 * @desc    Get all classes
 * @access  Authenticated
 */
router.get('/', auth, classController.getAllClasses);

/**
 * @route   GET /api/classes/:id
 * @desc    Get class by ID
 * @access  Authenticated
 */
router.get('/:id', auth, classValidators.getById, validate, classController.getClassById);

/**
 * @route   GET /api/classes/:id/students
 * @desc    Get students in a class
 * @access  Admin, Teacher
 */
router.get('/:id/students', auth, isTeacherOrAdmin, classValidators.getById, validate, classController.getClassStudents);

/**
 * @route   POST /api/classes
 * @desc    Create class
 * @access  Admin
 */
router.post('/', auth, isAdmin, classValidators.create, validate, classController.createClass);

/**
 * @route   PUT /api/classes/:id
 * @desc    Update class
 * @access  Admin
 */
router.put('/:id', auth, isAdmin, classValidators.update, validate, classController.updateClass);

/**
 * @route   DELETE /api/classes/:id
 * @desc    Delete class
 * @access  Admin
 */
router.delete('/:id', auth, isAdmin, classValidators.getById, validate, classController.deleteClass);

module.exports = router;
