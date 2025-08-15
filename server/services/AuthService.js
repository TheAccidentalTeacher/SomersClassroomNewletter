/**
 * JWT Authentication Service
 * Professional JWT token management with secure session handling
 */

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { DatabaseManager } = require('../config/database');
const logger = require('../utils/logger');

class AuthService {
    constructor() {
        this.jwtSecret = process.env.JWT_SECRET;
        this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '24h';
        this.refreshExpiresIn = process.env.REFRESH_EXPIRES_IN || '7d';
        
        if (!this.jwtSecret) {
            throw new Error('JWT_SECRET environment variable is required');
        }
        
        if (this.jwtSecret.length < 32) {
            throw new Error('JWT_SECRET must be at least 32 characters long');
        }
    }

    /**
     * Generate JWT access token
     */
    generateAccessToken(user) {
        const payload = {
            userId: user.id,
            email: user.email,
            isAdmin: user.isAdmin,
            tokenType: 'access'
        };

        return jwt.sign(payload, this.jwtSecret, {
            expiresIn: this.jwtExpiresIn,
            issuer: 'newsletter-generator',
            audience: 'newsletter-users'
        });
    }

    /**
     * Generate refresh token
     */
    generateRefreshToken() {
        return crypto.randomBytes(40).toString('hex');
    }

    /**
     * Create complete authentication session
     */
    async createSession(user, deviceInfo = {}, ipAddress = null) {
        const db = DatabaseManager.getInstance();
        const client = await db.getClient();

        try {
            await client.query('BEGIN');

            // Generate tokens
            const accessToken = this.generateAccessToken(user);
            const refreshToken = this.generateRefreshToken();
            const tokenHash = this.hashToken(refreshToken);

            // Calculate expiration
            const expiresAt = new Date();
            expiresAt.setTime(expiresAt.getTime() + this.parseExpiration(this.refreshExpiresIn));

            // Store session in database
            const sessionQuery = `
                INSERT INTO user_sessions (
                    user_id, token_hash, device_info, ip_address, expires_at
                ) VALUES ($1, $2, $3, $4, $5)
                RETURNING id
            `;

            const sessionResult = await client.query(sessionQuery, [
                user.id,
                tokenHash,
                deviceInfo,
                ipAddress,
                expiresAt
            ]);

            const sessionId = sessionResult.rows[0].id;

            // Clean up old sessions for this user (keep only 5 most recent)
            await this.cleanupOldSessions(user.id, client);

            await client.query('COMMIT');

            logger.info(`Session created for user: ${user.email}, Session ID: ${sessionId}`);

            return {
                accessToken,
                refreshToken,
                sessionId,
                expiresAt,
                user: user.toPublicJSON()
            };

        } catch (error) {
            await client.query('ROLLBACK');
            logger.error('Error creating session:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Verify and decode access token
     */
    verifyAccessToken(token) {
        try {
            const decoded = jwt.verify(token, this.jwtSecret, {
                issuer: 'newsletter-generator',
                audience: 'newsletter-users'
            });

            if (decoded.tokenType !== 'access') {
                throw new Error('Invalid token type');
            }

            return decoded;
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                throw new Error('Access token has expired');
            } else if (error.name === 'JsonWebTokenError') {
                throw new Error('Invalid access token');
            }
            throw error;
        }
    }

    /**
     * Refresh access token using refresh token
     */
    async refreshAccessToken(refreshToken, deviceInfo = {}, ipAddress = null) {
        const db = DatabaseManager.getInstance();
        const client = await db.getClient();

        try {
            await client.query('BEGIN');

            const tokenHash = this.hashToken(refreshToken);

            // Find valid session
            const sessionQuery = `
                SELECT s.*, u.* FROM user_sessions s
                JOIN users u ON s.user_id = u.id
                WHERE s.token_hash = $1 
                AND s.expires_at > NOW()
                AND u.is_active = true
            `;

            const sessionResult = await client.query(sessionQuery, [tokenHash]);

            if (sessionResult.rows.length === 0) {
                throw new Error('Invalid or expired refresh token');
            }

            const session = sessionResult.rows[0];
            const User = require('../models/User');
            const user = new User(session);

            // Generate new access token
            const newAccessToken = this.generateAccessToken(user);

            // Update session with new device info if provided
            if (Object.keys(deviceInfo).length > 0 || ipAddress) {
                const updateQuery = `
                    UPDATE user_sessions 
                    SET device_info = COALESCE($2, device_info), 
                        ip_address = COALESCE($3, ip_address)
                    WHERE id = $1
                `;
                await client.query(updateQuery, [session.id, deviceInfo, ipAddress]);
            }

            await client.query('COMMIT');

            logger.info(`Token refreshed for user: ${user.email}`);

            return {
                accessToken: newAccessToken,
                user: user.toPublicJSON(),
                expiresAt: session.expires_at
            };

        } catch (error) {
            await client.query('ROLLBACK');
            logger.error('Error refreshing token:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Logout user by invalidating session
     */
    async logout(refreshToken) {
        const db = DatabaseManager.getInstance();

        try {
            const tokenHash = this.hashToken(refreshToken);
            
            const query = 'DELETE FROM user_sessions WHERE token_hash = $1 RETURNING user_id';
            const result = await db.query(query, [tokenHash]);

            if (result.rows.length > 0) {
                logger.info(`User logged out: Session invalidated`);
                return true;
            }

            return false;
        } catch (error) {
            logger.error('Error during logout:', error);
            throw error;
        }
    }

    /**
     * Logout from all devices
     */
    async logoutAll(userId) {
        const db = DatabaseManager.getInstance();

        try {
            const query = 'DELETE FROM user_sessions WHERE user_id = $1';
            const result = await db.query(query, [userId]);

            logger.info(`All sessions invalidated for user ID: ${userId}, Count: ${result.rowCount}`);
            return result.rowCount;
        } catch (error) {
            logger.error('Error during logout all:', error);
            throw error;
        }
    }

    /**
     * Get user's active sessions
     */
    async getUserSessions(userId) {
        const db = DatabaseManager.getInstance();

        try {
            const query = `
                SELECT id, device_info, ip_address, created_at, expires_at
                FROM user_sessions
                WHERE user_id = $1 AND expires_at > NOW()
                ORDER BY created_at DESC
            `;

            const result = await db.query(query, [userId]);
            return result.rows;
        } catch (error) {
            logger.error('Error getting user sessions:', error);
            throw error;
        }
    }

    /**
     * Revoke specific session
     */
    async revokeSession(sessionId, userId) {
        const db = DatabaseManager.getInstance();

        try {
            const query = 'DELETE FROM user_sessions WHERE id = $1 AND user_id = $2';
            const result = await db.query(query, [sessionId, userId]);

            return result.rowCount > 0;
        } catch (error) {
            logger.error('Error revoking session:', error);
            throw error;
        }
    }

    /**
     * Hash token for secure storage
     */
    hashToken(token) {
        return crypto.createHash('sha256').update(token).digest('hex');
    }

    /**
     * Parse expiration time string to milliseconds
     */
    parseExpiration(expiresIn) {
        const units = {
            's': 1000,
            'm': 1000 * 60,
            'h': 1000 * 60 * 60,
            'd': 1000 * 60 * 60 * 24,
            'w': 1000 * 60 * 60 * 24 * 7
        };

        const match = expiresIn.match(/^(\d+)([smhdw])$/);
        if (!match) {
            throw new Error('Invalid expiration format');
        }

        const [, value, unit] = match;
        return parseInt(value) * units[unit];
    }

    /**
     * Clean up old sessions (keep only 5 most recent per user)
     */
    async cleanupOldSessions(userId, client = null) {
        const db = client || DatabaseManager.getInstance();

        try {
            const query = `
                DELETE FROM user_sessions 
                WHERE user_id = $1 
                AND id NOT IN (
                    SELECT id FROM user_sessions 
                    WHERE user_id = $1 
                    ORDER BY created_at DESC 
                    LIMIT 5
                )
            `;

            const result = await db.query(query, [userId]);
            
            if (result.rowCount > 0) {
                logger.info(`Cleaned up ${result.rowCount} old sessions for user: ${userId}`);
            }

        } catch (error) {
            logger.error('Error cleaning up old sessions:', error);
            // Don't throw - this is cleanup, shouldn't break main flow
        }
    }

    /**
     * Clean up expired sessions (for scheduled maintenance)
     */
    async cleanupExpiredSessions() {
        const db = DatabaseManager.getInstance();

        try {
            const query = 'DELETE FROM user_sessions WHERE expires_at < NOW()';
            const result = await db.query(query);

            logger.info(`Cleaned up ${result.rowCount} expired sessions`);
            return result.rowCount;
        } catch (error) {
            logger.error('Error cleaning up expired sessions:', error);
            throw error;
        }
    }

    /**
     * Validate session exists and is active
     */
    async validateSession(refreshToken) {
        const db = DatabaseManager.getInstance();

        try {
            const tokenHash = this.hashToken(refreshToken);
            
            const query = `
                SELECT s.*, u.email, u.is_active 
                FROM user_sessions s
                JOIN users u ON s.user_id = u.id
                WHERE s.token_hash = $1 
                AND s.expires_at > NOW()
                AND u.is_active = true
            `;

            const result = await db.query(query, [tokenHash]);
            return result.rows.length > 0 ? result.rows[0] : null;
        } catch (error) {
            logger.error('Error validating session:', error);
            throw error;
        }
    }

    /**
     * Get session statistics for monitoring
     */
    async getSessionStats() {
        const db = DatabaseManager.getInstance();

        try {
            const statsQuery = `
                SELECT 
                    COUNT(*) as total_sessions,
                    COUNT(DISTINCT user_id) as unique_users,
                    COUNT(CASE WHEN expires_at > NOW() THEN 1 END) as active_sessions,
                    COUNT(CASE WHEN expires_at <= NOW() THEN 1 END) as expired_sessions,
                    AVG(EXTRACT(EPOCH FROM (expires_at - created_at))/3600)::numeric(10,2) as avg_session_hours
                FROM user_sessions
            `;

            const result = await db.query(statsQuery);
            return result.rows[0];
        } catch (error) {
            logger.error('Error getting session stats:', error);
            throw error;
        }
    }
}

// Export singleton instance
module.exports = new AuthService();
