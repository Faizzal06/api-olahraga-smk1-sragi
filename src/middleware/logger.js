/**
 * API Request Logger Middleware
 * Logs all incoming API requests for debugging purposes
 */

const logger = (req, res, next) => {
    const startTime = Date.now();
    const timestamp = new Date().toISOString();

    // Log request info
    console.log('\n' + '═'.repeat(70));
    console.log(`📥 [${timestamp}] INCOMING REQUEST`);
    console.log('─'.repeat(70));
    console.log(`   Method:     ${req.method}`);
    console.log(`   URL:        ${req.originalUrl}`);
    console.log(`   IP:         ${req.ip || req.connection.remoteAddress}`);
    console.log(`   User-Agent: ${req.get('User-Agent') || 'N/A'}`);

    // Log authenticated user if exists
    if (req.user) {
        console.log(`   User:       ${req.user.name || req.user.email || req.user._id} (${req.user.role})`);
    }

    // Log request body (hanya jika ada dan bukan password)
    if (req.body && Object.keys(req.body).length > 0) {
        const sanitizedBody = { ...req.body };
        // Sembunyikan field sensitif
        if (sanitizedBody.password) sanitizedBody.password = '***HIDDEN***';
        if (sanitizedBody.newPassword) sanitizedBody.newPassword = '***HIDDEN***';
        if (sanitizedBody.confirmPassword) sanitizedBody.confirmPassword = '***HIDDEN***';
        console.log(`   Body:       ${JSON.stringify(sanitizedBody, null, 2).split('\n').join('\n               ')}`);
    }

    // Log query params jika ada
    if (req.query && Object.keys(req.query).length > 0) {
        console.log(`   Query:      ${JSON.stringify(req.query)}`);
    }

    // Intercept response untuk log response info
    const originalSend = res.send;
    res.send = function (body) {
        const responseTime = Date.now() - startTime;
        const statusCode = res.statusCode;

        // Tentukan emoji berdasarkan status code
        let statusEmoji = '✅';
        if (statusCode >= 400 && statusCode < 500) statusEmoji = '⚠️';
        if (statusCode >= 500) statusEmoji = '❌';

        console.log('─'.repeat(70));
        console.log(`📤 RESPONSE`);
        console.log(`   Status:     ${statusEmoji} ${statusCode}`);
        console.log(`   Time:       ${responseTime}ms`);

        // Log response body (truncate jika terlalu panjang)
        if (process.env.LOG_RESPONSE_BODY === 'true' && body) {
            try {
                const parsedBody = typeof body === 'string' ? JSON.parse(body) : body;
                const bodyStr = JSON.stringify(parsedBody);
                console.log(`   Response:   ${bodyStr.length > 200 ? bodyStr.substring(0, 200) + '...' : bodyStr}`);
            } catch (e) {
                // Body bukan JSON, skip
            }
        }

        console.log('═'.repeat(70) + '\n');

        return originalSend.call(this, body);
    };

    next();
};

/**
 * Simple logger - hanya log one-liner per request
 */
const simpleLogger = (req, res, next) => {
    const startTime = Date.now();

    res.on('finish', () => {
        const responseTime = Date.now() - startTime;
        const statusCode = res.statusCode;

        let statusEmoji = '✅';
        if (statusCode >= 400 && statusCode < 500) statusEmoji = '⚠️';
        if (statusCode >= 500) statusEmoji = '❌';

        const user = req.user ? `[${req.user.role}] ${req.user.name || req.user.email}` : 'Anonymous';

        console.log(`${statusEmoji} ${new Date().toISOString()} | ${req.method.padEnd(7)} ${req.originalUrl} | ${statusCode} | ${responseTime}ms | ${user}`);
    });

    next();
};

module.exports = { logger, simpleLogger };
