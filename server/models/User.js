/**
 * User Model
 * Professional user management with comprehensive validation and security
 */

const bcrypt = require('bcryptjs');
const { DatabaseManager } = require('../config/database');
const logger = require('../utils/logger');

class User {
    constructor(userData) {
        this.id = userData.id;
        this.email = userData.email;
        this.passwordHash = userData.password_hash; // Add this mapping
        this.displayName = userData.display_name;
        this.school = userData.school;
        this.subjects = userData.subjects || [];
        this.gradeLevels = userData.grade_levels || [];
        this.isAdmin = userData.is_admin || false;
        this.isActive = userData.is_active !== false;
        this.emailVerified = userData.email_verified || false;
        this.lastLogin = userData.last_login;
        this.preferences = userData.preferences || {};
        this.createdAt = userData.created_at;
        this.updatedAt = userData.updated_at;
    }

    /**
     * Create a new user with secure password hashing
     */
    static async create(userData) {
        const db = DatabaseManager.getInstance();
        const client = await db.getClient();

        try {
            await client.query('BEGIN');

            // Validate required fields
            const validation = this.validateUserData(userData);
            if (!validation.isValid) {
                throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
            }

            // Check if user already exists
            const existingUser = await this.findByEmail(userData.email);
            if (existingUser) {
                throw new Error('User with this email already exists');
            }

            // Hash password securely
            const passwordHash = await bcrypt.hash(userData.password, 12);

            // Insert user
            const insertQuery = `
                INSERT INTO users (
                    email, password_hash, display_name, school, 
                    subjects, grade_levels, is_admin, preferences
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING *
            `;

            const values = [
                userData.email.toLowerCase().trim(),
                passwordHash,
                userData.displayName.trim(),
                userData.school?.trim() || null,
                userData.subjects || [],
                userData.gradeLevels || [],
                userData.isAdmin || false,
                userData.preferences || {}
            ];

            const result = await client.query(insertQuery, values);
            
            // Log user creation
            await this.logActivity(result.rows[0].id, 'user_created', 'user', result.rows[0].id, {
                email: userData.email,
                displayName: userData.displayName
            });

            await client.query('COMMIT');
            
            logger.info(`User created successfully: ${userData.email}`);
            return new User(result.rows[0]);

        } catch (error) {
            await client.query('ROLLBACK');
            logger.error('Error creating user:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Find user by email address
     */
    static async findByEmail(email) {
        const db = DatabaseManager.getInstance();
        
        try {
            const query = 'SELECT * FROM users WHERE email = $1 AND is_active = true';
            const result = await db.query(query, [email.toLowerCase().trim()]);
            
            return result.rows.length > 0 ? new User(result.rows[0]) : null;
        } catch (error) {
            logger.error('Error finding user by email:', error);
            throw error;
        }
    }

    /**
     * Find user by ID
     */
    static async findById(id) {
        const db = DatabaseManager.getInstance();
        
        try {
            const query = 'SELECT * FROM users WHERE id = $1 AND is_active = true';
            const result = await db.query(query, [id]);
            
            return result.rows.length > 0 ? new User(result.rows[0]) : null;
        } catch (error) {
            logger.error('Error finding user by ID:', error);
            throw error;
        }
    }

    /**
     * Authenticate user with email and password
     */
    static async authenticate(email, password) {
        try {
            const user = await this.findByEmail(email);
            if (!user) {
                // Log failed attempt
                await this.logActivity(null, 'login_failed', 'auth', null, {
                    email,
                    reason: 'user_not_found'
                });
                return null;
            }

            // Check password
            const isValidPassword = await bcrypt.compare(password, user.passwordHash);
            if (!isValidPassword) {
                // Log failed attempt
                await this.logActivity(user.id, 'login_failed', 'auth', user.id, {
                    reason: 'invalid_password'
                });
                return null;
            }

            // Update last login
            await user.updateLastLogin();

            // Log successful login
            await this.logActivity(user.id, 'login_success', 'auth', user.id);

            logger.info(`User authenticated successfully: ${email}`);
            return user;

        } catch (error) {
            logger.error('Error authenticating user:', error);
            throw error;
        }
    }

    /**
     * Get user's password hash for authentication
     */
    async getPasswordHash() {
        const db = DatabaseManager.getInstance();
        
        try {
            const query = 'SELECT password_hash FROM users WHERE id = $1';
            const result = await db.query(query, [this.id]);
            
            return result.rows.length > 0 ? result.rows[0].password_hash : null;
        } catch (error) {
            logger.error('Error getting password hash:', error);
            throw error;
        }
    }

    /**
     * Update user's last login timestamp
     */
    async updateLastLogin() {
        const db = DatabaseManager.getInstance();
        
        try {
            const query = 'UPDATE users SET last_login = NOW() WHERE id = $1';
            await db.query(query, [this.id]);
            this.lastLogin = new Date();
        } catch (error) {
            logger.error('Error updating last login:', error);
            throw error;
        }
    }

    /**
     * Update user profile
     */
    async updateProfile(updateData) {
        const db = DatabaseManager.getInstance();
        const client = await db.getClient();

        try {
            await client.query('BEGIN');

            // Validate update data
            const validation = User.validateUpdateData(updateData);
            if (!validation.isValid) {
                throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
            }

            const updateFields = [];
            const values = [];
            let paramCount = 1;

            // Build dynamic update query
            Object.keys(updateData).forEach(key => {
                if (this.isUpdatableField(key) && updateData[key] !== undefined) {
                    updateFields.push(`${this.mapFieldName(key)} = $${paramCount}`);
                    values.push(updateData[key]);
                    paramCount++;
                }
            });

            if (updateFields.length === 0) {
                throw new Error('No valid fields to update');
            }

            values.push(this.id); // For WHERE clause
            const query = `
                UPDATE users 
                SET ${updateFields.join(', ')}, updated_at = NOW()
                WHERE id = $${paramCount}
                RETURNING *
            `;

            const result = await client.query(query, values);
            
            // Log profile update
            await User.logActivity(this.id, 'profile_updated', 'user', this.id, {
                fields: Object.keys(updateData)
            });

            await client.query('COMMIT');

            // Update current instance
            Object.assign(this, new User(result.rows[0]));
            
            logger.info(`User profile updated: ${this.email}`);
            return this;

        } catch (error) {
            await client.query('ROLLBACK');
            logger.error('Error updating user profile:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Change user password
     */
    async changePassword(currentPassword, newPassword) {
        const db = DatabaseManager.getInstance();
        const client = await db.getClient();

        try {
            await client.query('BEGIN');

            // Verify current password
            const passwordHash = await this.getPasswordHash();
            const isCurrentValid = await bcrypt.compare(currentPassword, passwordHash);
            
            if (!isCurrentValid) {
                throw new Error('Current password is incorrect');
            }

            // Validate new password
            const passwordValidation = User.validatePassword(newPassword);
            if (!passwordValidation.isValid) {
                throw new Error(`Password validation failed: ${passwordValidation.errors.join(', ')}`);
            }

            // Hash new password
            const newPasswordHash = await bcrypt.hash(newPassword, 12);

            // Update password
            const query = 'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2';
            await client.query(query, [newPasswordHash, this.id]);

            // Invalidate all existing sessions for security
            await this.invalidateAllSessions();

            // Log password change
            await User.logActivity(this.id, 'password_changed', 'auth', this.id);

            await client.query('COMMIT');
            
            logger.info(`Password changed for user: ${this.email}`);

        } catch (error) {
            await client.query('ROLLBACK');
            logger.error('Error changing password:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Invalidate all user sessions
     */
    async invalidateAllSessions() {
        const db = DatabaseManager.getInstance();
        
        try {
            const query = 'DELETE FROM user_sessions WHERE user_id = $1';
            await db.query(query, [this.id]);
            
            logger.info(`All sessions invalidated for user: ${this.email}`);
        } catch (error) {
            logger.error('Error invalidating sessions:', error);
            throw error;
        }
    }

    /**
     * Validate user data for creation
     */
    static validateUserData(userData) {
        const errors = [];

        // Email validation
        if (!userData.email || typeof userData.email !== 'string') {
            errors.push('Email is required');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
            errors.push('Invalid email format');
        }

        // Password validation
        const passwordValidation = this.validatePassword(userData.password);
        if (!passwordValidation.isValid) {
            errors.push(...passwordValidation.errors);
        }

        // Display name validation
        if (!userData.displayName || typeof userData.displayName !== 'string') {
            errors.push('Display name is required');
        } else if (userData.displayName.trim().length < 2) {
            errors.push('Display name must be at least 2 characters');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Validate password strength
     */
    static validatePassword(password) {
        const errors = [];

        if (!password || typeof password !== 'string') {
            errors.push('Password is required');
            return { isValid: false, errors };
        }

        if (password.length < 8) {
            errors.push('Password must be at least 8 characters long');
        }

        if (!/(?=.*[a-z])/.test(password)) {
            errors.push('Password must contain at least one lowercase letter');
        }

        if (!/(?=.*[A-Z])/.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        }

        if (!/(?=.*\d)/.test(password)) {
            errors.push('Password must contain at least one number');
        }

        if (!/(?=.*[!@#$%^&*])/.test(password)) {
            errors.push('Password must contain at least one special character (!@#$%^&*)');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Validate update data
     */
    static validateUpdateData(updateData) {
        const errors = [];
        const allowedFields = ['displayName', 'school', 'subjects', 'gradeLevels', 'preferences'];

        // Check for invalid fields
        Object.keys(updateData).forEach(key => {
            if (!allowedFields.includes(key)) {
                errors.push(`Field '${key}' is not allowed for update`);
            }
        });

        // Validate specific fields
        if (updateData.displayName !== undefined) {
            if (typeof updateData.displayName !== 'string' || updateData.displayName.trim().length < 2) {
                errors.push('Display name must be at least 2 characters');
            }
        }

        if (updateData.subjects !== undefined && !Array.isArray(updateData.subjects)) {
            errors.push('Subjects must be an array');
        }

        if (updateData.gradeLevels !== undefined && !Array.isArray(updateData.gradeLevels)) {
            errors.push('Grade levels must be an array');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Check if field can be updated
     */
    isUpdatableField(field) {
        const updatableFields = ['displayName', 'school', 'subjects', 'gradeLevels', 'preferences'];
        return updatableFields.includes(field);
    }

    /**
     * Map field names to database column names
     */
    mapFieldName(field) {
        const fieldMap = {
            displayName: 'display_name',
            gradeLevels: 'grade_levels'
        };
        return fieldMap[field] || field;
    }

    /**
     * Log user activity
     */
    static async logActivity(userId, action, resourceType, resourceId, metadata = {}) {
        const db = DatabaseManager.getInstance();
        
        try {
            const query = `
                INSERT INTO activity_logs (user_id, action, resource_type, resource_id, metadata)
                VALUES ($1, $2, $3, $4, $5)
            `;
            
            await db.query(query, [userId, action, resourceType, resourceId, metadata]);
        } catch (error) {
            logger.error('Error logging activity:', error);
            // Don't throw - logging shouldn't break the main operation
        }
    }

    /**
     * Get public user data (safe for API responses)
     */
    toPublicJSON() {
        return {
            id: this.id,
            email: this.email,
            displayName: this.displayName,
            school: this.school,
            subjects: this.subjects,
            gradeLevels: this.gradeLevels,
            isAdmin: this.isAdmin,
            emailVerified: this.emailVerified,
            lastLogin: this.lastLogin,
            preferences: this.preferences,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }

    /**
     * Get all users (admin only)
     */
    static async getAll(limit = 50, offset = 0) {
        const db = DatabaseManager.getInstance();
        
        try {
            const countQuery = 'SELECT COUNT(*) FROM users WHERE is_active = true';
            const countResult = await db.query(countQuery);
            const total = parseInt(countResult.rows[0].count);

            const query = `
                SELECT * FROM users 
                WHERE is_active = true 
                ORDER BY created_at DESC 
                LIMIT $1 OFFSET $2
            `;
            
            const result = await db.query(query, [limit, offset]);
            const users = result.rows.map(row => new User(row));

            return {
                users,
                total,
                limit,
                offset,
                hasMore: offset + limit < total
            };
        } catch (error) {
            logger.error('Error getting all users:', error);
            throw error;
        }
    }
}

module.exports = User;
