/**
 * Template Model
 * Professional template management with CRUD operations
 */

const { DatabaseManager } = require('../config/database');
const logger = require('../utils/logger');

class Template {
    constructor(templateData) {
        this.id = templateData.id;
        this.userId = templateData.user_id;
        this.name = templateData.name;
        this.description = templateData.description;
        this.content = templateData.content;
        this.settings = templateData.settings || {};
        this.isPublic = templateData.is_public || false;
        this.isGlobal = templateData.is_global || false;
        this.createdAt = templateData.created_at;
        this.updatedAt = templateData.updated_at;
    }

    /**
     * Create a new template
     */
    static async create(templateData, userId) {
        const db = DatabaseManager.getInstance();
        
        try {
            const query = `
                INSERT INTO templates (
                    user_id, name, description, content, settings, is_public, is_global
                ) VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING *
            `;
            
            const values = [
                userId,
                templateData.name,
                templateData.description || null,
                JSON.stringify(templateData.content || {}),
                JSON.stringify(templateData.settings || {}),
                templateData.isPublic || false,
                templateData.isGlobal || false
            ];
            
            const result = await db.query(query, values);
            
            if (result.rows.length > 0) {
                const template = new Template(result.rows[0]);
                
                // Log activity
                await this.logActivity(userId, 'template_created', 'template', template.id, {
                    name: template.name,
                    isPublic: template.isPublic
                });
                
                logger.info(`Template created: ${template.id} by user ${userId}`);
                return template;
            }
            
            return null;
        } catch (error) {
            logger.error('Error creating template:', error);
            throw error;
        }
    }

    /**
     * Find template by ID
     */
    static async findById(id, userId = null) {
        const db = DatabaseManager.getInstance();
        
        try {
            let query, values;
            
            if (userId) {
                // User context - check ownership or public visibility
                query = `
                    SELECT * FROM templates 
                    WHERE id = $1 AND (user_id = $2 OR is_public = true OR is_global = true)
                `;
                values = [id, userId];
            } else {
                // No user context - only public/global templates
                query = `
                    SELECT * FROM templates 
                    WHERE id = $1 AND (is_public = true OR is_global = true)
                `;
                values = [id];
            }
            
            const result = await db.query(query, values);
            
            if (result.rows.length > 0) {
                return new Template(result.rows[0]);
            }
            
            return null;
        } catch (error) {
            logger.error('Error finding template by ID:', error);
            throw error;
        }
    }

    /**
     * Find templates available to user
     */
    static async findAvailable(userId, options = {}) {
        const db = DatabaseManager.getInstance();
        
        try {
            let query = `
                SELECT * FROM templates 
                WHERE user_id = $1 OR is_public = true OR is_global = true
            `;
            let values = [userId];
            let paramCount = 1;
            
            // Add filters
            if (options.isPublic !== undefined) {
                paramCount++;
                query += ` AND is_public = $${paramCount}`;
                values.push(options.isPublic);
            }
            
            if (options.isGlobal !== undefined) {
                paramCount++;
                query += ` AND is_global = $${paramCount}`;
                values.push(options.isGlobal);
            }
            
            // Add ordering
            query += ' ORDER BY is_global DESC, is_public DESC, updated_at DESC';
            
            // Add pagination if provided
            if (options.limit) {
                paramCount++;
                query += ` LIMIT $${paramCount}`;
                values.push(options.limit);
                
                if (options.offset) {
                    paramCount++;
                    query += ` OFFSET $${paramCount}`;
                    values.push(options.offset);
                }
            }
            
            const result = await db.query(query, values);
            
            return result.rows.map(row => new Template(row));
        } catch (error) {
            logger.error('Error finding available templates:', error);
            throw error;
        }
    }

    /**
     * Find templates by user ID (owned by user)
     */
    static async findByUserId(userId, options = {}) {
        const db = DatabaseManager.getInstance();
        
        try {
            let query = 'SELECT * FROM templates WHERE user_id = $1';
            let values = [userId];
            let paramCount = 1;
            
            // Add filters
            if (options.isPublic !== undefined) {
                paramCount++;
                query += ` AND is_public = $${paramCount}`;
                values.push(options.isPublic);
            }
            
            // Add ordering
            query += ' ORDER BY updated_at DESC';
            
            // Add pagination if provided
            if (options.limit) {
                paramCount++;
                query += ` LIMIT $${paramCount}`;
                values.push(options.limit);
                
                if (options.offset) {
                    paramCount++;
                    query += ` OFFSET $${paramCount}`;
                    values.push(options.offset);
                }
            }
            
            const result = await db.query(query, values);
            
            return result.rows.map(row => new Template(row));
        } catch (error) {
            logger.error('Error finding templates by user ID:', error);
            throw error;
        }
    }

    /**
     * Update template
     */
    async update(updateData, userId) {
        const db = DatabaseManager.getInstance();
        
        try {
            const updateFields = [];
            const values = [];
            let paramCount = 0;
            
            // Build dynamic update query
            if (updateData.name !== undefined) {
                paramCount++;
                updateFields.push(`name = $${paramCount}`);
                values.push(updateData.name);
            }
            
            if (updateData.description !== undefined) {
                paramCount++;
                updateFields.push(`description = $${paramCount}`);
                values.push(updateData.description);
            }
            
            if (updateData.content !== undefined) {
                paramCount++;
                updateFields.push(`content = $${paramCount}`);
                values.push(JSON.stringify(updateData.content));
            }
            
            if (updateData.settings !== undefined) {
                paramCount++;
                updateFields.push(`settings = $${paramCount}`);
                values.push(JSON.stringify(updateData.settings));
            }
            
            if (updateData.isPublic !== undefined) {
                paramCount++;
                updateFields.push(`is_public = $${paramCount}`);
                values.push(updateData.isPublic);
            }
            
            // Always update updated_at
            paramCount++;
            updateFields.push(`updated_at = $${paramCount}`);
            values.push(new Date());
            
            // Add WHERE conditions
            paramCount++;
            values.push(this.id);
            paramCount++;
            values.push(userId);
            
            const query = `
                UPDATE templates 
                SET ${updateFields.join(', ')}
                WHERE id = $${paramCount - 1} AND user_id = $${paramCount}
                RETURNING *
            `;
            
            const result = await db.query(query, values);
            
            if (result.rows.length > 0) {
                const updatedTemplate = new Template(result.rows[0]);
                
                // Log activity
                await Template.logActivity(userId, 'template_updated', 'template', this.id, {
                    name: updatedTemplate.name,
                    changes: Object.keys(updateData)
                });
                
                logger.info(`Template updated: ${this.id} by user ${userId}`);
                return updatedTemplate;
            }
            
            return null;
        } catch (error) {
            logger.error('Error updating template:', error);
            throw error;
        }
    }

    /**
     * Delete template
     */
    async delete(userId) {
        const db = DatabaseManager.getInstance();
        
        try {
            const query = 'DELETE FROM templates WHERE id = $1 AND user_id = $2 RETURNING *';
            const result = await db.query(query, [this.id, userId]);
            
            if (result.rows.length > 0) {
                // Log activity
                await Template.logActivity(userId, 'template_deleted', 'template', this.id, {
                    name: this.name
                });
                
                logger.info(`Template deleted: ${this.id} by user ${userId}`);
                return true;
            }
            
            return false;
        } catch (error) {
            logger.error('Error deleting template:', error);
            throw error;
        }
    }

    /**
     * Get statistics for user's templates
     */
    static async getStats(userId) {
        const db = DatabaseManager.getInstance();
        
        try {
            const query = `
                SELECT 
                    COUNT(*) as total,
                    COUNT(CASE WHEN is_public = true THEN 1 END) as public_templates,
                    COUNT(CASE WHEN is_public = false THEN 1 END) as private_templates
                FROM templates 
                WHERE user_id = $1
            `;
            
            const result = await db.query(query, [userId]);
            
            return result.rows[0] || {
                total: 0,
                public_templates: 0,
                private_templates: 0
            };
        } catch (error) {
            logger.error('Error getting template stats:', error);
            throw error;
        }
    }

    /**
     * Log activity
     */
    static async logActivity(userId, action, resourceType, resourceId, metadata = {}) {
        const db = DatabaseManager.getInstance();
        
        try {
            const query = `
                INSERT INTO activity_logs (user_id, action, resource_type, resource_id, metadata)
                VALUES ($1, $2, $3, $4, $5)
            `;
            
            await db.query(query, [
                userId,
                action,
                resourceType,
                resourceId,
                JSON.stringify(metadata)
            ]);
        } catch (error) {
            logger.error('Error logging activity:', error);
            // Don't throw - logging failures shouldn't break the main operation
        }
    }

    /**
     * Convert to public JSON (safe for client)
     */
    toPublicJSON() {
        return {
            id: this.id,
            userId: this.userId,
            name: this.name,
            description: this.description,
            content: this.content,
            settings: this.settings,
            isPublic: this.isPublic,
            isGlobal: this.isGlobal,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}

module.exports = Template;
