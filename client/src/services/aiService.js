// AI Content Generation Service using OpenAI
import debugLogger from '../utils/debugLogger';
import apiService from './api';

class AIService {
  constructor() {
    // Check for client-side API key first (REACT_APP_ prefix)
    this.clientApiKey = process.env.REACT_APP_OPENAI_API_KEY;
    this.baseURL = 'https://api.openai.com/v1';
    
    if (!this.clientApiKey) {
      debugLogger.info('Client-side OpenAI API key not found. Will use server-side API.');
    } else {
      debugLogger.info('AI Service initialized with client-side OpenAI integration');
    }
  }

  async generateContent(type, context = {}) {
    // Try client-side first if API key is available
    if (this.clientApiKey) {
      try {
        return await this.generateContentDirect(type, context);
      } catch (error) {
        debugLogger.warn('Client-side AI generation failed, falling back to server', { error: error.message });
        // Fall through to server-side
      }
    }
    
    // Use server-side API as fallback or primary method
    return await this.generateContentViaServer(type, context);
  }

  async generateContentDirect(type, context = {}) {
    if (!this.clientApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const prompt = this.buildPrompt(type, context);
      
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.clientApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant that writes professional newsletter content for teachers. Keep content appropriate for school communications and engaging for parents.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 500,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const generatedContent = data.choices[0]?.message?.content?.trim();
      
      if (!generatedContent) {
        throw new Error('No content generated from OpenAI');
      }

      debugLogger.info('AI content generated successfully (direct)', { 
        type, 
        contentLength: generatedContent.length 
      });

      return generatedContent;

    } catch (error) {
      debugLogger.error('Direct AI content generation failed', { error: error.message, type });
      throw error;
    }
  }

  async generateContentViaServer(type, context = {}) {
    try {
      debugLogger.info('Generating AI content via server', { type });
      
      const response = await apiService.post('/ai/generate-content', {
        type,
        context
      });

      if (!response.success) {
        throw new Error(response.error || 'Server AI generation failed');
      }

      debugLogger.info('AI content generated successfully (server)', { 
        type, 
        contentLength: response.content.length 
      });

      return response.content;

    } catch (error) {
      debugLogger.error('Server AI content generation failed', { error: error.message, type });
      throw error;
    }
  }

  async checkAvailability() {
    // Check if client-side is available
    if (this.clientApiKey) {
      return { available: true, method: 'client-side' };
    }

    // Check server-side availability
    try {
      const response = await apiService.get('/ai/status');
      return { 
        available: response.available, 
        method: 'server-side',
        message: response.message
      };
    } catch (error) {
      return { 
        available: false, 
        method: 'none',
        message: 'AI service unavailable'
      };
    }
  }

  buildPrompt(type, context) {
    const { 
      subject = '',
      gradeLevel = '',
      teacherName = '',
      previousContent = '',
      weeklyHighlights = [],
      upcomingEvents = [],
      studentAchievements = []
    } = context;

    const baseContext = subject || gradeLevel ? 
      `Context: ${subject} ${gradeLevel} classroom taught by ${teacherName || 'the teacher'}.` : 
      `Context: Classroom taught by ${teacherName || 'the teacher'}.`;

    switch (type) {
      case 'weekly-summary':
        return `${baseContext} Write a friendly and professional weekly summary for parents. Include what students learned this week, any highlights, and maintain an encouraging tone. Keep it 2-3 paragraphs.
        
Weekly highlights: ${weeklyHighlights.join(', ') || 'General learning activities'}`;

      case 'upcoming-events':
        return `${baseContext} Write a brief introduction paragraph for upcoming events. Make it engaging and encouraging for parent participation. Keep it 1-2 paragraphs.
        
Upcoming events: ${upcomingEvents.join(', ') || 'Various school activities'}`;

      case 'student-achievements':
        return `${baseContext} Write a positive paragraph celebrating student achievements and progress. Focus on effort, growth, and specific accomplishments. Keep it encouraging and inclusive. 1-2 paragraphs.
        
Achievements to highlight: ${studentAchievements.join(', ') || 'Student progress and effort'}`;

      case 'parent-communication':
        return `${baseContext} Write a warm, professional paragraph for parent communication. Include ways parents can support learning at home and encourage engagement. Keep it friendly and actionable. 1-2 paragraphs.`;

      case 'announcement':
        return `${baseContext} Write a clear, concise announcement for parents. Make it informative and friendly while maintaining professionalism. Keep it 1 paragraph.
        
Previous content for context: ${previousContent}`;

      case 'curriculum-update':
        return `${baseContext} Write an informative update about curriculum and learning objectives. Explain what students are working on in terms parents can understand. Keep it 2-3 paragraphs.
        
Subject focus: ${subject || 'Current curriculum topics'}`;

      default:
        return `${baseContext} Write professional, engaging newsletter content that would be appropriate for parent communication. Keep it friendly, informative, and encouraging. 2-3 paragraphs.`;
    }
  }

  // Quick content suggestions for different scenarios
  getContentSuggestions(sectionType) {
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

    return suggestions[sectionType] || [
      'Here\'s what\'s happening in our classroom...',
      'I wanted to share some updates with you...',
      'Thank you for your continued support...'
    ];
  }
}

export default new AIService();
