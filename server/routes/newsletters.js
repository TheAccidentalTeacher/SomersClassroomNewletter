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
      
      const newsletter = await Newsletter.create(req.body, req.user.id);
      
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