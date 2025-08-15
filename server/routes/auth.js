/**
 * Authentication Routes
 * Professional authentication endpoints with comprehensive validation and security
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');
const AuthService = require('../services/AuthService');
const { 
    authenticate, 
    validateRefreshToken, 
    createAuthRateLimit,
    logAuthEvent,
    getClientIP,
    getDeviceInfo 
} = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Rate limiting for auth endpoints
const loginRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: {
        success: false,
        message: 'Too many login attempts. Please try again later.',
        code: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false
});

const registerRateLimit = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // Limit each IP to 3 registration attempts per hour
    message: {
        success: false,
        message: 'Too many registration attempts. Please try again later.',
        code: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Validation rules
const registerValidation = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Valid email is required'),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/)
        .withMessage('Password must contain at least one lowercase letter, uppercase letter, number, and special character'),
    body('displayName')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Display name must be between 2 and 100 characters'),
    body('school')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('School name must not exceed 100 characters'),
    body('subjects')
        .optional()
        .isArray()
        .withMessage('Subjects must be an array'),
    body('gradeLevels')
        .optional()
        .isArray()
        .withMessage('Grade levels must be an array'),
    body('preferences')
        .optional()
        .isObject()
        .withMessage('Preferences must be an object')
];

const loginValidation = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Valid email is required'),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
];

/**
 * GET /auth/status
 * Health check endpoint
 */
router.get('/status', (req, res) => {
    res.json({ 
        success: true,
        message: 'Authentication service is ready',
        timestamp: new Date().toISOString()
    });
});

/**
 * POST /auth/register
 * Register a new user
 */
router.post('/register', 
    registerRateLimit,
    logAuthEvent('register'),
    registerValidation,
    async (req, res) => {
        try {
            // Check validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors.array(),
                    code: 'VALIDATION_ERROR'
                });
            }

            const { email, password, displayName, school, subjects, gradeLevels, preferences } = req.body;

            // Create user
            const user = await User.create({
                email,
                password,
                displayName,
                school,
                subjects: subjects || [],
                gradeLevels: gradeLevels || [],
                preferences: preferences || {}
            });

            // Create authentication session
            const deviceInfo = getDeviceInfo(req);
            const ipAddress = getClientIP(req);
            
            const authData = await AuthService.createSession(user, deviceInfo, ipAddress);

            logger.info(`User registered successfully: ${email}`);

            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                data: {
                    user: authData.user,
                    accessToken: authData.accessToken,
                    refreshToken: authData.refreshToken,
                    expiresAt: authData.expiresAt
                }
            });

        } catch (error) {
            logger.error('Registration error:', error);

            if (error.message.includes('already exists')) {
                return res.status(409).json({
                    success: false,
                    message: 'User with this email already exists',
                    code: 'USER_EXISTS'
                });
            }

            if (error.message.includes('Validation failed')) {
                return res.status(400).json({
                    success: false,
                    message: error.message,
                    code: 'VALIDATION_ERROR'
                });
            }

            res.status(500).json({
                success: false,
                message: 'Internal server error during registration',
                code: 'REGISTRATION_ERROR'
            });
        }
    }
);

/**
 * POST /auth/login
 * Authenticate user and return tokens
 */
router.post('/login',
    loginRateLimit,
    logAuthEvent('login'),
    loginValidation,
    async (req, res) => {
        try {
            // Check validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors.array(),
                    code: 'VALIDATION_ERROR'
                });
            }

            const { email, password } = req.body;

            // Debug: Log what we received
            console.log('Login request body:', req.body);
            console.log('Email:', email);
            console.log('Password type:', typeof password);
            console.log('Password defined:', password !== undefined);

            // Authenticate user
            const user = await User.authenticate(email, password);
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password',
                    code: 'INVALID_CREDENTIALS'
                });
            }

            // Create authentication session
            const deviceInfo = getDeviceInfo(req);
            const ipAddress = getClientIP(req);
            
            const authData = await AuthService.createSession(user, deviceInfo, ipAddress);

            logger.info(`User logged in successfully: ${email}`);

            res.json({
                success: true,
                message: 'Login successful',
                data: {
                    user: authData.user,
                    accessToken: authData.accessToken,
                    refreshToken: authData.refreshToken,
                    expiresAt: authData.expiresAt
                }
            });

        } catch (error) {
            logger.error('Login error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error during login',
                code: 'LOGIN_ERROR'
            });
        }
    }
);

/**
 * POST /auth/refresh
 * Refresh access token using refresh token
 */
router.post('/refresh',
    logAuthEvent('refresh'),
    validateRefreshToken,
    async (req, res) => {
        try {
            const deviceInfo = getDeviceInfo(req);
            const ipAddress = getClientIP(req);

            const authData = await AuthService.refreshAccessToken(
                req.refreshToken, 
                deviceInfo, 
                ipAddress
            );

            res.json({
                success: true,
                message: 'Token refreshed successfully',
                data: {
                    user: authData.user,
                    accessToken: authData.accessToken,
                    expiresAt: authData.expiresAt
                }
            });

        } catch (error) {
            logger.error('Token refresh error:', error);
            
            if (error.message.includes('Invalid or expired')) {
                return res.status(401).json({
                    success: false,
                    message: error.message,
                    code: 'REFRESH_TOKEN_INVALID'
                });
            }

            res.status(500).json({
                success: false,
                message: 'Internal server error during token refresh',
                code: 'REFRESH_ERROR'
            });
        }
    }
);

/**
 * POST /auth/logout
 * Logout user and invalidate refresh token
 */
router.post('/logout',
    logAuthEvent('logout'),
    async (req, res) => {
        try {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                return res.status(400).json({
                    success: false,
                    message: 'Refresh token is required',
                    code: 'REFRESH_TOKEN_MISSING'
                });
            }

            const success = await AuthService.logout(refreshToken);

            res.json({
                success: true,
                message: success ? 'Logged out successfully' : 'Already logged out',
                data: { loggedOut: success }
            });

        } catch (error) {
            logger.error('Logout error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error during logout',
                code: 'LOGOUT_ERROR'
            });
        }
    }
);

/**
 * POST /auth/logout-all
 * Logout user from all devices
 */
router.post('/logout-all',
    authenticate,
    logAuthEvent('logout-all'),
    async (req, res) => {
        try {
            const count = await AuthService.logoutAll(req.user.id);

            res.json({
                success: true,
                message: 'Logged out from all devices',
                data: { sessionsInvalidated: count }
            });

        } catch (error) {
            logger.error('Logout all error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error during logout',
                code: 'LOGOUT_ERROR'
            });
        }
    }
);

/**
 * GET /auth/me
 * Get current user profile
 */
router.get('/me',
    authenticate,
    async (req, res) => {
        try {
            res.json({
                success: true,
                message: 'User profile retrieved',
                data: {
                    user: req.user.toPublicJSON()
                }
            });

        } catch (error) {
            logger.error('Get profile error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                code: 'PROFILE_ERROR'
            });
        }
    }
);

/**
 * PUT /auth/profile
 * Update user profile
 */
router.put('/profile',
    authenticate,
    [
        body('displayName')
            .optional()
            .trim()
            .isLength({ min: 2, max: 100 })
            .withMessage('Display name must be between 2 and 100 characters'),
        body('school')
            .optional()
            .trim()
            .isLength({ max: 100 })
            .withMessage('School name must not exceed 100 characters'),
        body('subjects')
            .optional()
            .isArray()
            .withMessage('Subjects must be an array'),
        body('gradeLevels')
            .optional()
            .isArray()
            .withMessage('Grade levels must be an array'),
        body('preferences')
            .optional()
            .isObject()
            .withMessage('Preferences must be an object')
    ],
    async (req, res) => {
        try {
            // Check validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors.array(),
                    code: 'VALIDATION_ERROR'
                });
            }

            const allowedFields = ['displayName', 'school', 'subjects', 'gradeLevels', 'preferences'];
            const updateData = {};

            // Filter only allowed fields
            allowedFields.forEach(field => {
                if (req.body[field] !== undefined) {
                    updateData[field] = req.body[field];
                }
            });

            if (Object.keys(updateData).length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No valid fields to update',
                    code: 'NO_UPDATE_DATA'
                });
            }

            const updatedUser = await req.user.updateProfile(updateData);

            res.json({
                success: true,
                message: 'Profile updated successfully',
                data: {
                    user: updatedUser.toPublicJSON()
                }
            });

        } catch (error) {
            logger.error('Profile update error:', error);

            if (error.message.includes('Validation failed')) {
                return res.status(400).json({
                    success: false,
                    message: error.message,
                    code: 'VALIDATION_ERROR'
                });
            }

            res.status(500).json({
                success: false,
                message: 'Internal server error during profile update',
                code: 'UPDATE_ERROR'
            });
        }
    }
);

/**
 * POST /auth/change-password
 * Change user password
 */
router.post('/change-password',
    authenticate,
    [
        body('currentPassword')
            .notEmpty()
            .withMessage('Current password is required'),
        body('newPassword')
            .isLength({ min: 8 })
            .withMessage('New password must be at least 8 characters')
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/)
            .withMessage('New password must contain at least one lowercase letter, uppercase letter, number, and special character')
    ],
    async (req, res) => {
        try {
            // Check validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors.array(),
                    code: 'VALIDATION_ERROR'
                });
            }

            const { currentPassword, newPassword } = req.body;

            await req.user.changePassword(currentPassword, newPassword);

            res.json({
                success: true,
                message: 'Password changed successfully. Please log in again.'
            });

        } catch (error) {
            logger.error('Password change error:', error);

            if (error.message.includes('Current password is incorrect')) {
                return res.status(400).json({
                    success: false,
                    message: error.message,
                    code: 'INVALID_CURRENT_PASSWORD'
                });
            }

            if (error.message.includes('validation failed')) {
                return res.status(400).json({
                    success: false,
                    message: error.message,
                    code: 'VALIDATION_ERROR'
                });
            }

            res.status(500).json({
                success: false,
                message: 'Internal server error during password change',
                code: 'PASSWORD_CHANGE_ERROR'
            });
        }
    }
);

/**
 * GET /auth/sessions
 * Get user's active sessions
 */
router.get('/sessions',
    authenticate,
    async (req, res) => {
        try {
            const sessions = await AuthService.getUserSessions(req.user.id);

            res.json({
                success: true,
                message: 'Sessions retrieved successfully',
                data: {
                    sessions: sessions.map(session => ({
                        id: session.id,
                        deviceInfo: session.device_info,
                        ipAddress: session.ip_address,
                        createdAt: session.created_at,
                        expiresAt: session.expires_at
                    }))
                }
            });

        } catch (error) {
            logger.error('Get sessions error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                code: 'SESSIONS_ERROR'
            });
        }
    }
);

/**
 * DELETE /auth/sessions/:sessionId
 * Revoke a specific session
 */
router.delete('/sessions/:sessionId',
    authenticate,
    async (req, res) => {
        try {
            const { sessionId } = req.params;
            const success = await AuthService.revokeSession(sessionId, req.user.id);

            if (!success) {
                return res.status(404).json({
                    success: false,
                    message: 'Session not found',
                    code: 'SESSION_NOT_FOUND'
                });
            }

            res.json({
                success: true,
                message: 'Session revoked successfully'
            });

        } catch (error) {
            logger.error('Revoke session error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                code: 'REVOKE_ERROR'
            });
        }
    }
);

module.exports = router;