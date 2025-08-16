/**
 * Template Routes
 * Professional template management API with authentication
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const Template = require('../models/Template');
const logger = require('../utils/logger');

const router = express.Router();

// Apply authentication to all template routes
router.use(authenticate);

/**
 * GET /api/templates
 * Get available templates (user's own + public/global)
 */
router.get('/', async (req, res) => {
  try {
    const { limit, offset, public_only, my_templates_only } = req.query;
    
    const options = {};
    if (limit) options.limit = parseInt(limit);
    if (offset) options.offset = parseInt(offset);
    
    let templates;
    let stats;
    
    if (my_templates_only === 'true') {
      // Only user's own templates
      templates = await Template.findByUserId(req.user.id, options);
      stats = await Template.getStats(req.user.id);
    } else if (public_only === 'true') {
      // Only public/global templates
      options.isPublic = true;
      templates = await Template.findAvailable(req.user.id, options);
      stats = { total: templates.length, public_templates: templates.length, private_templates: 0 };
    } else {
      // All available templates
      templates = await Template.findAvailable(req.user.id, options);
      stats = await Template.getStats(req.user.id);
    }
    
    res.json({
      success: true,
      data: {
        templates: templates.map(t => t.toPublicJSON()),
        stats,
        pagination: {
          limit: options.limit || null,
          offset: options.offset || 0,
          total: templates.length
        }
      }
    });
    
  } catch (error) {
    logger.error('Error fetching templates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch templates',
      code: 'FETCH_ERROR'
    });
  }
});

/**
 * GET /api/templates/:id
 * Get template by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const template = await Template.findById(req.params.id, req.user.id);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found or access denied',
        code: 'TEMPLATE_NOT_FOUND'
      });
    }
    
    res.json({
      success: true,
      data: {
        template: template.toPublicJSON()
      }
    });
    
  } catch (error) {
    logger.error('Error fetching template:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch template',
      code: 'FETCH_ERROR'
    });
  }
});

/**
 * POST /api/templates
 * Create a new template
 */
router.post('/',
  [
    body('name')
      .isLength({ min: 3, max: 200 })
      .withMessage('Template name must be between 3 and 200 characters'),
    body('description')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Description must be less than 1000 characters'),
    body('content')
      .isObject()
      .withMessage('Content must be a valid object'),
    body('settings')
      .optional()
      .isObject()
      .withMessage('Settings must be a valid object'),
    body('isPublic')
      .optional()
      .isBoolean()
      .withMessage('isPublic must be a boolean')
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
      
      const template = await Template.create(req.body, req.user.id);
      
      if (!template) {
        return res.status(500).json({
          success: false,
          message: 'Failed to create template',
          code: 'CREATE_ERROR'
        });
      }
      
      res.status(201).json({
        success: true,
        message: 'Template created successfully',
        data: {
          template: template.toPublicJSON()
        }
      });
      
    } catch (error) {
      logger.error('Error creating template:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create template',
        code: 'CREATE_ERROR'
      });
    }
  }
);

/**
 * PUT /api/templates/:id
 * Update template
 */
router.put('/:id',
  [
    body('name')
      .optional()
      .isLength({ min: 3, max: 200 })
      .withMessage('Template name must be between 3 and 200 characters'),
    body('description')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Description must be less than 1000 characters'),
    body('content')
      .optional()
      .isObject()
      .withMessage('Content must be a valid object'),
    body('settings')
      .optional()
      .isObject()
      .withMessage('Settings must be a valid object'),
    body('isPublic')
      .optional()
      .isBoolean()
      .withMessage('isPublic must be a boolean')
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
      
      const template = await Template.findById(req.params.id, req.user.id);
      
      if (!template) {
        return res.status(404).json({
          success: false,
          message: 'Template not found or access denied',
          code: 'TEMPLATE_NOT_FOUND'
        });
      }
      
      // Only allow owner to update
      if (template.userId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied - not template owner',
          code: 'ACCESS_DENIED'
        });
      }
      
      const updatedTemplate = await template.update(req.body, req.user.id);
      
      res.json({
        success: true,
        message: 'Template updated successfully',
        data: {
          template: updatedTemplate.toPublicJSON()
        }
      });
      
    } catch (error) {
      logger.error('Error updating template:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update template',
        code: 'UPDATE_ERROR'
      });
    }
  }
);

/**
 * DELETE /api/templates/:id
 * Delete template
 */
router.delete('/:id', async (req, res) => {
  try {
    const template = await Template.findById(req.params.id, req.user.id);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found or access denied',
        code: 'TEMPLATE_NOT_FOUND'
      });
    }
    
    // Only allow owner to delete
    if (template.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied - not template owner',
        code: 'ACCESS_DENIED'
      });
    }
    
    const deleted = await template.delete(req.user.id);
    
    if (deleted) {
      res.json({
        success: true,
        message: 'Template deleted successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to delete template',
        code: 'DELETE_ERROR'
      });
    }
    
  } catch (error) {
    logger.error('Error deleting template:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete template',
      code: 'DELETE_ERROR'
    });
  }
});

/**
 * POST /api/templates/:id/duplicate
 * Duplicate a template (create new template from existing)
 */
router.post('/:id/duplicate', async (req, res) => {
  try {
    const originalTemplate = await Template.findById(req.params.id, req.user.id);
    
    if (!originalTemplate) {
      return res.status(404).json({
        success: false,
        message: 'Template not found or access denied',
        code: 'TEMPLATE_NOT_FOUND'
      });
    }
    
    const duplicateData = {
      name: `${originalTemplate.name} (Copy)`,
      description: originalTemplate.description,
      content: originalTemplate.content,
      settings: originalTemplate.settings,
      isPublic: false // Duplicates are private by default
    };
    
    const duplicate = await Template.create(duplicateData, req.user.id);
    
    res.status(201).json({
      success: true,
      message: 'Template duplicated successfully',
      data: {
        template: duplicate.toPublicJSON()
      }
    });
    
  } catch (error) {
    logger.error('Error duplicating template:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to duplicate template',
      code: 'DUPLICATE_ERROR'
    });
  }
});

module.exports = router;