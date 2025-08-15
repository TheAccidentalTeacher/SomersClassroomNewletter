/**
 * Authentication Middleware
 * Professional middleware for JWT token validation and user authentication
 */

const AuthService = require('../services/AuthService');
const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * Extract token from request headers
 */
function extractToken(req) {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
        return null;
    }

    // Support both "Bearer token" and "token" formats
    if (authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }
    
    return authHeader;
}

/**
 * Get client IP address
 */
function getClientIP(req) {
    return req.ip || 
           req.connection?.remoteAddress || 
           req.socket?.remoteAddress || 
           req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
           'unknown';
}

/**
 * Get device info from request headers
 */
function getDeviceInfo(req) {
    return {
        userAgent: req.headers['user-agent'] || 'unknown',
        acceptLanguage: req.headers['accept-language'] || 'unknown',
        origin: req.headers.origin || req.headers.referer || 'unknown'
    };
}

/**
 * Core authentication middleware
 */
const authenticate = async (req, res, next) => {
    try {
        const token = extractToken(req);
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access token is required',
                code: 'TOKEN_MISSING'
            });
        }

        // Verify the token
        let decoded;
        try {
            decoded = AuthService.verifyAccessToken(token);
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: error.message,
                code: error.message.includes('expired') ? 'TOKEN_EXPIRED' : 'TOKEN_INVALID'
            });
        }

        // Get user from database
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found or inactive',
                code: 'USER_NOT_FOUND'
            });
        }

        // Attach user and auth info to request
        req.user = user;
        req.auth = {
            userId: user.id,
            isAdmin: user.isAdmin,
            tokenData: decoded
        };

        // Log successful authentication for monitoring
        logger.debug(`User authenticated: ${user.email}, IP: ${getClientIP(req)}`);

        next();

    } catch (error) {
        logger.error('Authentication middleware error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal authentication error',
            code: 'AUTH_ERROR'
        });
    }
};

/**
 * Optional authentication middleware (doesn't fail if no token)
 */
const optionalAuth = async (req, res, next) => {
    try {
        const token = extractToken(req);
        
        if (!token) {
            // No token provided, continue without authentication
            req.user = null;
            req.auth = null;
            return next();
        }

        // Try to authenticate, but don't fail if token is invalid
        try {
            const decoded = AuthService.verifyAccessToken(token);
            const user = await User.findById(decoded.userId);
            
            if (user) {
                req.user = user;
                req.auth = {
                    userId: user.id,
                    isAdmin: user.isAdmin,
                    tokenData: decoded
                };
            } else {
                req.user = null;
                req.auth = null;
            }
        } catch (error) {
            // Invalid token, continue without authentication
            req.user = null;
            req.auth = null;
        }

        next();

    } catch (error) {
        logger.error('Optional auth middleware error:', error);
        // Don't fail the request for optional auth
        req.user = null;
        req.auth = null;
        next();
    }
};

/**
 * Admin-only middleware (requires authentication + admin role)
 */
const requireAdmin = async (req, res, next) => {
    try {
        // First authenticate the user
        await new Promise((resolve, reject) => {
            authenticate(req, res, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        // Check if user is admin
        if (!req.user || !req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Admin access required',
                code: 'ADMIN_REQUIRED'
            });
        }

        logger.debug(`Admin access granted: ${req.user.email}`);
        next();

    } catch (error) {
        // Error will be handled by authenticate middleware
        return;
    }
};

/**
 * Rate limiting middleware for authentication endpoints
 */
const createAuthRateLimit = (windowMs = 15 * 60 * 1000, maxAttempts = 5) => {
    const attempts = new Map();

    return (req, res, next) => {
        const clientIP = getClientIP(req);
        const now = Date.now();
        const windowStart = now - windowMs;

        // Clean old attempts
        const clientAttempts = attempts.get(clientIP) || [];
        const recentAttempts = clientAttempts.filter(timestamp => timestamp > windowStart);

        if (recentAttempts.length >= maxAttempts) {
            logger.warn(`Rate limit exceeded for IP: ${clientIP}`);
            return res.status(429).json({
                success: false,
                message: 'Too many authentication attempts. Please try again later.',
                code: 'RATE_LIMIT_EXCEEDED',
                retryAfter: Math.ceil(windowMs / 1000)
            });
        }

        // Record this attempt
        recentAttempts.push(now);
        attempts.set(clientIP, recentAttempts);

        next();
    };
};

/**
 * Middleware to validate refresh token
 */
const validateRefreshToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: 'Refresh token is required',
                code: 'REFRESH_TOKEN_MISSING'
            });
        }

        // Validate the refresh token
        const session = await AuthService.validateSession(refreshToken);
        if (!session) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired refresh token',
                code: 'REFRESH_TOKEN_INVALID'
            });
        }

        // Attach session info to request
        req.session = session;
        req.refreshToken = refreshToken;

        next();

    } catch (error) {
        logger.error('Refresh token validation error:', error);
        return res.status(500).json({
            success: false,
            message: 'Token validation error',
            code: 'VALIDATION_ERROR'
        });
    }
};

/**
 * Middleware to check if user owns resource
 */
const requireOwnership = (resourceIdField = 'id', userIdField = 'user_id') => {
    return async (req, res, next) => {
        try {
            // Must be authenticated first
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required',
                    code: 'AUTH_REQUIRED'
                });
            }

            // Admins can access any resource
            if (req.user.isAdmin) {
                return next();
            }

            // Get resource ID from params or body
            const resourceId = req.params[resourceIdField] || req.body[resourceIdField];
            if (!resourceId) {
                return res.status(400).json({
                    success: false,
                    message: 'Resource ID is required',
                    code: 'RESOURCE_ID_MISSING'
                });
            }

            // This middleware sets up the ownership check
            // The actual resource loading and ownership verification
            // should be done in the route handler
            req.resourceId = resourceId;
            req.userIdField = userIdField;

            next();

        } catch (error) {
            logger.error('Ownership middleware error:', error);
            return res.status(500).json({
                success: false,
                message: 'Authorization error',
                code: 'AUTH_ERROR'
            });
        }
    };
};

/**
 * Middleware to log authentication events
 */
const logAuthEvent = (eventType) => {
    return (req, res, next) => {
        // Store original send method
        const originalSend = res.send;

        // Override send to capture response
        res.send = function(data) {
            // Log the event
            const clientIP = getClientIP(req);
            const deviceInfo = getDeviceInfo(req);
            const success = res.statusCode < 400;

            logger.info(`Auth Event: ${eventType}`, {
                success,
                statusCode: res.statusCode,
                clientIP,
                userAgent: deviceInfo.userAgent,
                userId: req.user?.id,
                email: req.user?.email
            });

            // Call original send
            originalSend.call(this, data);
        };

        next();
    };
};

module.exports = {
    authenticate,
    optionalAuth,
    requireAdmin,
    validateRefreshToken,
    requireOwnership,
    createAuthRateLimit,
    logAuthEvent,
    extractToken,
    getClientIP,
    getDeviceInfo
};
