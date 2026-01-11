const express = require('express');
const router = express.Router();
const { authController } = require('../controllers');
const { auth } = require('../middleware');
const validate = require('../middleware/validate');
const { authValidators } = require('../utils/validators');

/**
 * @route   POST /api/auth/login
 * @desc    Login user (siswa dengan NIS, guru/admin dengan email)
 * @access  Public
 */
router.post('/login', authValidators.login, validate, authController.login);

/**
 * @route   POST /api/auth/register
 * @desc    Register user baru (hanya admin)
 * @access  Admin
 */
router.post('/register', auth, authValidators.register, validate, authController.register);

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Authenticated
 */
router.get('/profile', auth, authController.getProfile);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update current user profile
 * @access  Authenticated
 */
router.put('/profile', auth, authController.updateProfile);

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change password
 * @access  Authenticated
 */
router.put('/change-password', auth, authValidators.changePassword, validate, authController.changePassword);

module.exports = router;
