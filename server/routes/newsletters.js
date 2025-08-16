/**
 * Newsletter Routes
 * Professional newsletter management API with authentication
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const Newsletter = require('../models/Newsletter');
const logger = require('../utils/logger');

const router = express.Router();

// Apply authentication to all newsletter routes
router.use(authenticate);

/**
 * GET /api/newsletters
 * Get user's newsletters with optional filtering
 */
router.get('/', async (req, res) => {
  try {
    const { status, limit, offset } = req.query;
    
    const options = {};
    if (status) options.status = status;
    if (limit) options.limit = parseInt(limit);
    if (offset) options.offset = parseInt(offset);
    
    const newsletters = await Newsletter.findByUserId(req.user.id, options);
    const stats = await Newsletter.getStats(req.user.id);
    
    res.json({
      success: true,
      data: {
        newsletters: newsletters.map(n => n.toPublicJSON()),
        stats,
        pagination: {
          limit: options.limit || null,
          offset: options.offset || 0,
          total: stats.total
        }
      }
    });
    
  } catch (error) {
    logger.error('Error fetching newsletters:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch newsletters',
      code: 'FETCH_ERROR'
    });
  }
});

/**
 * POST /api/newsletters
 * Create a new newsletter
 */
router.post('/',
  [
    body('title')
      .isLength({ min: 3, max: 300 })
      .withMessage('Title must be between 3 and 300 characters'),
    body('content')
      .optional()
      .isObject()
      .withMessage('Content must be a valid object'),
    body('settings')
      .optional()
      .isObject()
      .withMessage('Settings must be a valid object'),
    body('status')
      .optional()
      .isIn(['draft', 'published', 'archived'])
      .withMessage('Status must be draft, published, or archived'),
    body('templateId')
      .optional()
      .isUUID()
      .withMessage('Template ID must be a valid UUID')
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
      
      // If no content provided, create default structured content
      const newsletterData = { ...req.body };
      if (!newsletterData.content || Object.keys(newsletterData.content).length === 0) {
        newsletterData.content = {
          version: '1.0',
          sections: [
            {
              id: `section-${Date.now()}-title`,
              type: 'title',
              order: 0,
              data: {
                title: newsletterData.title || 'Newsletter Title',
                subtitle: '',
                style: {
                  fontSize: '2xl',
                  textAlign: 'center',
                  color: '#1f2937'
                }
              }
            },
            {
              id: `section-${Date.now()}-text`,
              type: 'richText',
              order: 1,
              data: {
                content: 'Welcome to this week\'s newsletter! Add your content here...',
                style: {
                  fontSize: 'base',
                  textAlign: 'left'
                }
              }
            },
            {
              id: `section-${Date.now()}-events`,
              type: 'events',
              order: 2,
              data: {
                title: 'Upcoming Events',
                events: [
                  {
                    id: 1,
                    date: new Date().toISOString().split('T')[0],
                    title: 'Sample Event',
                    description: 'Event description goes here'
                  }
                ]
              }
            },
            {
              id: `section-${Date.now()}-contact`,
              type: 'contact',
              order: 3,
              data: {
                title: 'Contact Information',
                teacherName: 'Teacher Name',
                email: 'teacher@school.edu',
                phone: '(555) 123-4567',
                room: 'Room 123',
                officeHours: 'Mon-Fri 3:00-4:00 PM'
              }
            }
          ],
          theme: {
            primaryColor: '#3b82f6',
            backgroundColor: '#ffffff',
            fontFamily: 'Inter, sans-serif'
          }
        };
      }
      
      const newsletter = await Newsletter.create(newsletterData, req.user.id);
      
      if (newsletter) {
        res.status(201).json({
          success: true,
          message: 'Newsletter created successfully',
          data: {
            newsletter: newsletter.toPublicJSON()
          }
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Failed to create newsletter',
          code: 'CREATE_ERROR'
        });
      }
      
    } catch (error) {
      logger.error('Error creating newsletter:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during newsletter creation',
        code: 'CREATE_ERROR'
      });
    }
  }
);

/**
 * GET /api/newsletters/:id
 * Get a specific newsletter by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const newsletter = await Newsletter.findById(id, req.user.id);
    
    if (!newsletter) {
      return res.status(404).json({
        success: false,
        message: 'Newsletter not found',
        code: 'NOT_FOUND'
      });
    }
    
    res.json({
      success: true,
      data: {
        newsletter: newsletter.toPublicJSON()
      }
    });
    
  } catch (error) {
    logger.error('Error fetching newsletter:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch newsletter',
      code: 'FETCH_ERROR'
    });
  }
});

/**
 * PUT /api/newsletters/:id
 * Update a newsletter
 */
router.put('/:id',
  [
    body('title')
      .optional()
      .isLength({ min: 3, max: 300 })
      .withMessage('Title must be between 3 and 300 characters'),
    body('content')
      .optional()
      .isObject()
      .withMessage('Content must be a valid object'),
    body('settings')
      .optional()
      .isObject()
      .withMessage('Settings must be a valid object'),
    body('status')
      .optional()
      .isIn(['draft', 'published', 'archived'])
      .withMessage('Status must be draft, published, or archived')
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
      
      const { id } = req.params;
      
      const newsletter = await Newsletter.findById(id, req.user.id);
      
      if (!newsletter) {
        return res.status(404).json({
          success: false,
          message: 'Newsletter not found',
          code: 'NOT_FOUND'
        });
      }
      
      const updatedNewsletter = await newsletter.update(req.body, req.user.id);
      
      if (updatedNewsletter) {
        res.json({
          success: true,
          message: 'Newsletter updated successfully',
          data: {
            newsletter: updatedNewsletter.toPublicJSON()
          }
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Failed to update newsletter',
          code: 'UPDATE_ERROR'
        });
      }
      
    } catch (error) {
      logger.error('Error updating newsletter:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during newsletter update',
        code: 'UPDATE_ERROR'
      });
    }
  }
);

/**
 * DELETE /api/newsletters/:id
 * Delete a newsletter
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const newsletter = await Newsletter.findById(id, req.user.id);
    
    if (!newsletter) {
      return res.status(404).json({
        success: false,
        message: 'Newsletter not found',
        code: 'NOT_FOUND'
      });
    }
    
    const deleted = await newsletter.delete(req.user.id);
    
    if (deleted) {
      res.json({
        success: true,
        message: 'Newsletter deleted successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to delete newsletter',
        code: 'DELETE_ERROR'
      });
    }
    
  } catch (error) {
    logger.error('Error deleting newsletter:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during newsletter deletion',
      code: 'DELETE_ERROR'
    });
  }
});

/**
 * POST /api/newsletters/:id/duplicate
 * Duplicate a newsletter
 */
router.post('/:id/duplicate', async (req, res) => {
  try {
    const { id } = req.params;
    
    const original = await Newsletter.findById(id, req.user.id);
    
    if (!original) {
      return res.status(404).json({
        success: false,
        message: 'Newsletter not found',
        code: 'NOT_FOUND'
      });
    }
    
    // Create duplicate with modified title
    const duplicateData = {
      title: `${original.title} (Copy)`,
      content: original.content,
      settings: original.settings,
      status: 'draft',
      templateId: original.templateId
    };
    
    const duplicate = await Newsletter.create(duplicateData, req.user.id);
    
    if (duplicate) {
      res.status(201).json({
        success: true,
        message: 'Newsletter duplicated successfully',
        data: {
          newsletter: duplicate.toPublicJSON()
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to duplicate newsletter',
        code: 'DUPLICATE_ERROR'
      });
    }
    
  } catch (error) {
    logger.error('Error duplicating newsletter:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during newsletter duplication',
      code: 'DUPLICATE_ERROR'
    });
  }
});

/**
 * GET /api/newsletters/stats
 * Get newsletter statistics for the user
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await Newsletter.getStats(req.user.id);
    
    res.json({
      success: true,
      data: {
        stats
      }
    });
    
  } catch (error) {
    logger.error('Error fetching newsletter stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch newsletter statistics',
      code: 'STATS_ERROR'
    });
  }
});

module.exports = router;