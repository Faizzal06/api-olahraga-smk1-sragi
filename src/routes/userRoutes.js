const express = require('express');
const router = express.Router();
const { userController } = require('../controllers');
const { auth, isAdmin, isTeacherOrAdmin } = require('../middleware');
const validate = require('../middleware/validate');
const { userValidators } = require('../utils/validators');

/**
 * @route   GET /api/users
 * @desc    Get all users
 * @access  Admin, Teacher
 */
router.get('/', auth, isTeacherOrAdmin, userController.getAllUsers);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Admin, Teacher
 */
router.get('/:id', auth, isTeacherOrAdmin, userValidators.getById, validate, userController.getUserById);

/**
 * @route   POST /api/users
 * @desc    Create user
 * @access  Admin
 */
router.post('/', auth, isAdmin, userValidators.create, validate, userController.createUser);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user
 * @access  Admin
 */
router.put('/:id', auth, isAdmin, userValidators.update, validate, userController.updateUser);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user
 * @access  Admin
 */
router.delete('/:id', auth, isAdmin, userValidators.getById, validate, userController.deleteUser);

/**
 * @route   PUT /api/users/:id/reset-password
 * @desc    Reset user password
 * @access  Admin
 */
router.put('/:id/reset-password', auth, isAdmin, userValidators.getById, validate, userController.resetPassword);

module.exports = router;
