const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const classRoutes = require('./classRoutes');
const activityRoutes = require('./activityRoutes');
const announcementRoutes = require('./announcementRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const exportRoutes = require('./exportRoutes');

// API Routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/classes', classRoutes);
router.use('/activities', activityRoutes);
router.use('/announcements', announcementRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/export', exportRoutes);

// Health check
router.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'API is running',
        timestamp: new Date().toISOString()
    });
});

router.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'API is running',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
