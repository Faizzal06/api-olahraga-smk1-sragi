require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/database');
const routes = require('./routes');
const { errorHandler, notFound, logger, simpleLogger } = require('./middleware');

const app = express();

// Connect to MongoDB
connectDB();

// Security Middleware
app.use(helmet());

// CORS Configuration
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate Limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: 'Terlalu banyak request dari IP ini. Silakan coba lagi nanti.',
        error: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false
});
app.use('/api', limiter);

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Logger Middleware (untuk debugging)
// Gunakan 'logger' untuk log detail, atau 'simpleLogger' untuk log ringkas
if (process.env.NODE_ENV !== 'production' || process.env.ENABLE_API_LOG === 'true') {
    app.use(simpleLogger); // Ganti dengan 'logger' untuk log detail
}

// API Routes
app.use('/api', routes);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to Tracking Activity API',
        version: '1.0.0',
        documentation: '/api/health'
    });
});

// 404 Handler
app.use(notFound);

// Global Error Handler
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║   🚀 Tracking Activity API Server                              ║
║                                                                ║
║   Server running on port ${PORT}                                  ║
║   Environment: ${process.env.NODE_ENV || 'development'}                              ║
║                                                                ║
║   API Endpoints:                                               ║
║   • GET  /api/health          - Health check                   ║
║   • POST /api/auth/login      - Login                          ║
║   • GET  /api/dashboard/*     - Dashboard                      ║
║   • *    /api/activities      - Activities                     ║
║   • *    /api/announcements   - Announcements                  ║
║   • *    /api/users           - Users                          ║
║   • *    /api/classes         - Classes                        ║
║   • GET  /api/export/*        - Export Data                    ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
  `);
});

module.exports = app;
