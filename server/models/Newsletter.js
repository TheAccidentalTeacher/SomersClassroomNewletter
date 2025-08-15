/**
 * Newsletter Model
 * Professional newsletter management with CRUD operations
 */

const { DatabaseManager } = require('../config/database');
const logger = require('../utils/logger');

class Newsletter {
    constructor(newsletterData) {
        this.id = newsletterData.id;
        this.userId = newsletterData.user_id;
        this.templateId = newsletterData.template_id;
        this.title = newsletterData.title;
        this.content = newsletterData.content;
        this.settings = newsletterData.settings || {};
        this.status = newsletterData.status || 'draft';
        this.publishDate = newsletterData.publish_date;
        this.lastExported = newsletterData.last_exported;
        this.viewCount = newsletterData.view_count || 0;
        this.createdAt = newsletterData.created_at;
        this.updatedAt = newsletterData.updated_at;
    }

    /**
     * Create a new newsletter
     */
    static async create(newsletterData, userId) {
        const db = DatabaseManager.getInstance();
        
        try {
            const query = `
                INSERT INTO newsletters (
                    user_id, template_id, title, content, settings, status
                ) VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *
            `;
            
            const values = [
                userId,
                newsletterData.templateId || null,
                newsletterData.title,
                JSON.stringify(newsletterData.content || {}),
                JSON.stringify(newsletterData.settings || {}),
                newsletterData.status || 'draft'
            ];
            
            const result = await db.query(query, values);
            
            if (result.rows.length > 0) {
                const newsletter = new Newsletter(result.rows[0]);
                
                // Log activity
                await this.logActivity(userId, 'newsletter_created', 'newsletter', newsletter.id, {
                    title: newsletter.title,
                    status: newsletter.status
                });
                
                logger.info(`Newsletter created: ${newsletter.id} by user ${userId}`);
                return newsletter;
            }
            
            return null;
        } catch (error) {
            logger.error('Error creating newsletter:', error);
            throw error;
        }
    }

    /**
     * Find newsletter by ID
     */
    static async findById(id, userId = null) {
        const db = DatabaseManager.getInstance();
        
        try {
            let query = 'SELECT * FROM newsletters WHERE id = $1';
            let values = [id];
            
            // If userId provided, ensure user has access
            if (userId) {
                query += ' AND user_id = $2';
                values.push(userId);
            }
            
            const result = await db.query(query, values);
            
            return result.rows.length > 0 ? new Newsletter(result.rows[0]) : null;
        } catch (error) {
            logger.error('Error finding newsletter by ID:', error);
            throw error;
        }
    }

    /**
     * Find newsletters by user ID
     */
    static async findByUserId(userId, options = {}) {
        const db = DatabaseManager.getInstance();
        
        try {
            let query = 'SELECT * FROM newsletters WHERE user_id = $1';
            let values = [userId];
            let paramCount = 1;
            
            // Add status filter if provided
            if (options.status) {
                paramCount++;
                query += ` AND status = $${paramCount}`;
                values.push(options.status);
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
            
            return result.rows.map(row => new Newsletter(row));
        } catch (error) {
            logger.error('Error finding newsletters by user ID:', error);
            throw error;
        }
    }

    /**
     * Update newsletter
     */
    async update(updateData, userId) {
        const db = DatabaseManager.getInstance();
        
        try {
            const updateFields = [];
            const values = [];
            let paramCount = 0;
            
            // Build dynamic update query
            if (updateData.title !== undefined) {
                paramCount++;
                updateFields.push(`title = $${paramCount}`);
                values.push(updateData.title);
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
            
            if (updateData.status !== undefined) {
                paramCount++;
                updateFields.push(`status = $${paramCount}`);
                values.push(updateData.status);
            }
            
            if (updateData.publishDate !== undefined) {
                paramCount++;
                updateFields.push(`publish_date = $${paramCount}`);
                values.push(updateData.publishDate);
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
                UPDATE newsletters 
                SET ${updateFields.join(', ')}
                WHERE id = $${paramCount - 1} AND user_id = $${paramCount}
                RETURNING *
            `;
            
            const result = await db.query(query, values);
            
            if (result.rows.length > 0) {
                const updatedNewsletter = new Newsletter(result.rows[0]);
                
                // Log activity
                await Newsletter.logActivity(userId, 'newsletter_updated', 'newsletter', this.id, {
                    title: updatedNewsletter.title,
                    changes: Object.keys(updateData)
                });
                
                logger.info(`Newsletter updated: ${this.id} by user ${userId}`);
                return updatedNewsletter;
            }
            
            return null;
        } catch (error) {
            logger.error('Error updating newsletter:', error);
            throw error;
        }
    }

    /**
     * Delete newsletter
     */
    async delete(userId) {
        const db = DatabaseManager.getInstance();
        
        try {
            const query = 'DELETE FROM newsletters WHERE id = $1 AND user_id = $2 RETURNING id';
            const result = await db.query(query, [this.id, userId]);
            
            if (result.rows.length > 0) {
                // Log activity
                await Newsletter.logActivity(userId, 'newsletter_deleted', 'newsletter', this.id, {
                    title: this.title
                });
                
                logger.info(`Newsletter deleted: ${this.id} by user ${userId}`);
                return true;
            }
            
            return false;
        } catch (error) {
            logger.error('Error deleting newsletter:', error);
            throw error;
        }
    }

    /**
     * Get statistics for user's newsletters
     */
    static async getStats(userId) {
        const db = DatabaseManager.getInstance();
        
        try {
            const query = `
                SELECT 
                    COUNT(*) as total,
                    COUNT(CASE WHEN status = 'draft' THEN 1 END) as drafts,
                    COUNT(CASE WHEN status = 'published' THEN 1 END) as published,
                    COUNT(CASE WHEN status = 'archived' THEN 1 END) as archived,
                    COALESCE(SUM(view_count), 0) as total_views
                FROM newsletters 
                WHERE user_id = $1
            `;
            
            const result = await db.query(query, [userId]);
            
            return result.rows[0] || {
                total: 0,
                drafts: 0,
                published: 0,
                archived: 0,
                total_views: 0
            };
        } catch (error) {
            logger.error('Error getting newsletter stats:', error);
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
            // Don't throw - activity logging is non-critical
        }
    }

    /**
     * Convert to public JSON (safe for client)
     */
    toPublicJSON() {
        return {
            id: this.id,
            title: this.title,
            content: this.content,
            settings: this.settings,
            status: this.status,
            publishDate: this.publishDate,
            lastExported: this.lastExported,
            viewCount: this.viewCount,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            templateId: this.templateId
        };
    }
}

module.exports = Newsletter;
