// Image API Routes - Stock photo search and AI-powered suggestions
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const imageService = require('../services/imageService');
const logger = require('../utils/logger');

/**
 * GET /api/images/status
 * Check image service availability
 */
router.get('/status', async (req, res) => {
  try {
    const status = await imageService.checkAvailability();
    
    logger.info('Image service status checked', { 
      available: status.available,
      providers: Object.keys(status.providers).filter(p => status.providers[p])
    });

    res.json(status);
  } catch (error) {
    logger.error('Image service status check failed', { error: error.message });
    res.status(500).json({
      available: false,
      message: 'Failed to check image service status',
      error: error.message
    });
  }
});

/**
 * POST /api/images/search
 * Search for images using query and filters
 * Requires authentication
 */
router.post('/search', auth, async (req, res) => {
  try {
    const { 
      query, 
      page = 1, 
      perPage = 12, 
      orientation = 'all', 
      color = 'all',
      category = 'all',
      safe = true 
    } = req.body;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }

    logger.info('Image search requested', { 
      query, 
      page, 
      perPage, 
      userId: req.user?.id 
    });

    const results = await imageService.searchImages(query, {
      page,
      perPage,
      orientation,
      color,
      category,
      safe
    });

    res.json({
      success: true,
      ...results
    });

  } catch (error) {
    logger.error('Image search failed', { 
      error: error.message, 
      query: req.body.query,
      userId: req.user?.id 
    });

    res.status(500).json({
      success: false,
      error: 'Image search failed',
      message: error.message
    });
  }
});

/**
 * GET /api/images/curated/:category
 * Get curated images for educational categories
 * Requires authentication
 */
router.get('/curated/:category', auth, async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, perPage = 12, orientation = 'all' } = req.query;

    const validCategories = [
      'classroom', 'science', 'math', 'reading', 'art', 'sports', 
      'nature', 'celebration', 'announcement', 'events'
    ];

    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid category',
        validCategories
      });
    }

    logger.info('Curated images requested', { 
      category, 
      page, 
      perPage,
      userId: req.user?.id 
    });

    const results = await imageService.getCuratedImages(category, {
      page: parseInt(page),
      perPage: parseInt(perPage),
      orientation
    });

    res.json({
      success: true,
      ...results
    });

  } catch (error) {
    logger.error('Curated images request failed', { 
      error: error.message, 
      category: req.params.category,
      userId: req.user?.id 
    });

    res.status(500).json({
      success: false,
      error: 'Failed to load curated images',
      message: error.message
    });
  }
});

/**
 * POST /api/images/suggestions
 * Generate AI-powered image search suggestions based on content
 * Requires authentication
 */
router.post('/suggestions', auth, async (req, res) => {
  try {
    const { content, contentType = 'general' } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Content is required for generating suggestions'
      });
    }

    logger.info('Image suggestions requested', { 
      contentLength: content.length, 
      contentType,
      userId: req.user?.id 
    });

    const suggestions = await imageService.generateImageSuggestions(content, contentType);

    res.json({
      success: true,
      suggestions,
      contentType,
      count: suggestions.length
    });

  } catch (error) {
    logger.error('Image suggestions generation failed', { 
      error: error.message,
      contentType: req.body.contentType,
      userId: req.user?.id 
    });

    res.status(500).json({
      success: false,
      error: 'Failed to generate image suggestions',
      message: error.message
    });
  }
});

/**
 * GET /api/images/categories
 * Get available image categories with descriptions
 */
router.get('/categories', auth, (req, res) => {
  try {
    const categories = [
      {
        id: 'classroom',
        name: 'Classroom',
        description: 'Classroom environments, students learning, school supplies',
        icon: '🏫'
      },
      {
        id: 'science',
        name: 'Science',
        description: 'Science experiments, laboratory equipment, nature',
        icon: '🔬'
      },
      {
        id: 'math',
        name: 'Mathematics',
        description: 'Math concepts, geometry, calculators, numbers',
        icon: '📐'
      },
      {
        id: 'reading',
        name: 'Reading & Literature',
        description: 'Books, libraries, reading activities',
        icon: '📚'
      },
      {
        id: 'art',
        name: 'Arts & Creativity',
        description: 'Art supplies, creative activities, student artwork',
        icon: '🎨'
      },
      {
        id: 'sports',
        name: 'Physical Education',
        description: 'Sports activities, playground, physical education',
        icon: '⚽'
      },
      {
        id: 'nature',
        name: 'Nature & Outdoors',
        description: 'Nature scenes, outdoor learning, environmental education',
        icon: '🌳'
      },
      {
        id: 'celebration',
        name: 'Celebrations',
        description: 'Achievements, success, happy moments, celebrations',
        icon: '🎉'
      },
      {
        id: 'announcement',
        name: 'Announcements',
        description: 'Important news, attention-grabbing imagery',
        icon: '📢'
      },
      {
        id: 'events',
        name: 'School Events',
        description: 'School activities, gatherings, community events',
        icon: '📅'
      }
    ];

    logger.info('Image categories requested', { 
      categoriesCount: categories.length,
      userId: req.user?.id 
    });

    res.json({
      success: true,
      categories,
      count: categories.length
    });

  } catch (error) {
    logger.error('Image categories request failed', { 
      error: error.message,
      userId: req.user?.id 
    });

    res.status(500).json({
      success: false,
      error: 'Failed to load image categories',
      message: error.message
    });
  }
});

/**
 * POST /api/images/analyze-content
 * Analyze newsletter content and suggest relevant images
 * Requires authentication
 */
router.post('/analyze-content', auth, async (req, res) => {
  try {
    const { sections } = req.body;

    if (!sections || !Array.isArray(sections)) {
      return res.status(400).json({
        success: false,
        error: 'Newsletter sections are required'
      });
    }

    logger.info('Content analysis requested', { 
      sectionsCount: sections.length,
      userId: req.user?.id 
    });

    const analysis = [];

    for (const section of sections) {
      if (section.type === 'richtext' && section.content) {
        const suggestions = await imageService.generateImageSuggestions(
          section.content, 
          section.title || 'general'
        );

        analysis.push({
          sectionId: section.id,
          sectionTitle: section.title || 'Untitled Section',
          suggestions: suggestions.slice(0, 5), // Top 5 suggestions
          contentType: section.title || 'general'
        });
      }
    }

    res.json({
      success: true,
      analysis,
      totalSections: analysis.length
    });

  } catch (error) {
    logger.error('Content analysis failed', { 
      error: error.message,
      userId: req.user?.id 
    });

    res.status(500).json({
      success: false,
      error: 'Content analysis failed',
      message: error.message
    });
  }
});

module.exports = router;