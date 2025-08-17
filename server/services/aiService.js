// Server-side AI Service for complex operations
const logger = require('../utils/logger');
const fetch = require('node-fetch');

class AIService {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    this.baseURL = 'https://api.openai.com/v1';
    
    if (!this.apiKey) {
      logger.warn('OpenAI API key not found in environment variables');
    } else {
      logger.info('Server AI Service initialized with OpenAI integration');
    }
  }

  async generateContent(type, context = {}) {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const prompt = this.buildPrompt(type, context);
      
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
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

      logger.info('Server AI content generated successfully', { 
        type, 
        contentLength: generatedContent.length 
      });

      return generatedContent;

    } catch (error) {
      logger.error('Server AI content generation failed', { error: error.message, type });
      throw error;
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

  isAvailable() {
    return !!this.apiKey;
  }
}

module.exports = new AIService();
