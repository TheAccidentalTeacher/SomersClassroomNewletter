const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const aiService = require('../services/aiService');
const logger = require('../utils/logger');

// Check AI service availability
router.get('/status', auth, (req, res) => {
  res.json({
    success: true,
    available: aiService.isAvailable(),
    message: aiService.isAvailable() 
      ? 'AI service is available'
      : 'AI service is not configured'
  });
});

// Generate AI content
router.post('/generate-content', auth, async (req, res) => {
  try {
    const { type, context } = req.body;

    if (!type) {
      return res.status(400).json({
        success: false,
        error: 'Content type is required'
      });
    }

    if (!aiService.isAvailable()) {
      return res.status(503).json({
        success: false,
        error: 'AI service is not available. OpenAI API key not configured.'
      });
    }

    logger.info('AI content generation requested', { 
      userId: req.user.id,
      type,
      context: Object.keys(context || {})
    });

    const generatedContent = await aiService.generateContent(type, context);

    res.json({
      success: true,
      content: generatedContent,
      type
    });

  } catch (error) {
    logger.error('AI content generation failed', { 
      error: error.message, 
      userId: req.user.id,
      type: req.body.type
    });

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate content'
    });
  }
});

// Get content suggestions (no API call needed)
router.get('/suggestions/:type', auth, (req, res) => {
  const { type } = req.params;
  
  const suggestions = {
    'weekly-summary': [
      'This week in math, we explored fractions through hands-on pizza activities...',
      'Students have been working hard on their reading comprehension skills...',
      'Our science unit on weather patterns has been exciting and engaging...'
    ],
    'upcoming-events': [
      'Mark your calendars for these exciting upcoming events...',
      'We have several wonderful opportunities coming up for family engagement...',
      'Don\'t miss these important dates and activities...'
    ],
    'student-achievements': [
      'I\'m so proud of the progress our students have made this week...',
      'Several students have shown exceptional growth in...',
      'Our classroom community has been working together beautifully...'
    ],
    'parent-communication': [
      'Here are some ways you can support your child\'s learning at home...',
      'Thank you for your continued partnership in your child\'s education...',
      'We appreciate your support and look forward to...'
    ]
  };

  res.json({
    success: true,
    suggestions: suggestions[type] || [
      'Here\'s what\'s happening in our classroom...',
      'I wanted to share some updates with you...',
      'Thank you for your continued support...'
    ]
  });
});

router.post('/generate-images', (req, res) => {
  // TODO: Generate images using AI (Phase 3.2)
  res.json({ message: 'AI image generation endpoint - implementation pending Phase 3.2' });
});

module.exports = router;