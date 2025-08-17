import React, { useState } from 'react';
import aiService from '../../services/aiService';

const AIContentGenerator = ({ onContentGenerated, existingContent = '', sectionType = 'general' }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [contentType, setContentType] = useState('weekly-summary');
  const [context, setContext] = useState({
    subject: '',
    gradeLevel: '',
    teacherName: '',
    weeklyHighlights: '',
    upcomingEvents: '',
    studentAchievements: ''
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [error, setError] = useState('');

  const contentTypes = [
    { value: 'weekly-summary', label: 'Weekly Summary', description: 'Summarize what students learned this week' },
    { value: 'upcoming-events', label: 'Event Introduction', description: 'Introduce upcoming events and activities' },
    { value: 'student-achievements', label: 'Student Achievements', description: 'Celebrate student progress and accomplishments' },
    { value: 'parent-communication', label: 'Parent Communication', description: 'Ways parents can support learning at home' },
    { value: 'announcement', label: 'Announcement', description: 'Important news or updates for parents' },
    { value: 'curriculum-update', label: 'Curriculum Update', description: 'Explain current learning objectives and topics' }
  ];

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError('');

    try {
      // Parse comma-separated lists
      const processedContext = {
        ...context,
        weeklyHighlights: context.weeklyHighlights ? context.weeklyHighlights.split(',').map(item => item.trim()) : [],
        upcomingEvents: context.upcomingEvents ? context.upcomingEvents.split(',').map(item => item.trim()) : [],
        studentAchievements: context.studentAchievements ? context.studentAchievements.split(',').map(item => item.trim()) : [],
        previousContent: existingContent
      };

      const generatedContent = await aiService.generateContent(contentType, processedContext);
      onContentGenerated(generatedContent);
      
    } catch (err) {
      console.error('AI content generation failed:', err);
      setError(err.message || 'Failed to generate content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSuggestion = (suggestion) => {
    onContentGenerated(suggestion);
  };

  const currentType = contentTypes.find(type => type.value === contentType);
  const suggestions = aiService.getContentSuggestions(contentType);

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border-2 border-blue-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-2">
            <span className="text-white text-sm font-bold">AI</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-800">AI Content Generator</h3>
        </div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          {showAdvanced ? 'Simple' : 'Advanced'}
        </button>
      </div>

      {error && (
        <div className="mb-3 p-2 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Content Type Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          What type of content do you need?
        </label>
        <select
          value={contentType}
          onChange={(e) => setContentType(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {contentTypes.map(type => (
            <option key={type.value} value={type.value}>
              {type.label} - {type.description}
            </option>
          ))}
        </select>
      </div>

      {/* Advanced Context Fields */}
      {showAdvanced && (
        <div className="mb-4 p-3 bg-white rounded border">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Context Information (Optional)</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Subject</label>
              <input
                type="text"
                value={context.subject}
                onChange={(e) => setContext({...context, subject: e.target.value})}
                placeholder="Math, Science, English..."
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Grade Level</label>
              <input
                type="text"
                value={context.gradeLevel}
                onChange={(e) => setContext({...context, gradeLevel: e.target.value})}
                placeholder="3rd Grade, Middle School..."
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
          
          {contentType === 'weekly-summary' && (
            <div className="mt-3">
              <label className="block text-xs font-medium text-gray-600 mb-1">Weekly Highlights (comma separated)</label>
              <input
                type="text"
                value={context.weeklyHighlights}
                onChange={(e) => setContext({...context, weeklyHighlights: e.target.value})}
                placeholder="fractions lesson, reading comprehension, science experiment..."
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          )}
          
          {contentType === 'upcoming-events' && (
            <div className="mt-3">
              <label className="block text-xs font-medium text-gray-600 mb-1">Upcoming Events (comma separated)</label>
              <input
                type="text"
                value={context.upcomingEvents}
                onChange={(e) => setContext({...context, upcomingEvents: e.target.value})}
                placeholder="field trip, parent conference, book fair..."
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          )}
          
          {contentType === 'student-achievements' && (
            <div className="mt-3">
              <label className="block text-xs font-medium text-gray-600 mb-1">Student Achievements (comma separated)</label>
              <input
                type="text"
                value={context.studentAchievements}
                onChange={(e) => setContext({...context, studentAchievements: e.target.value})}
                placeholder="improved math scores, completed projects, reading goals..."
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          )}
        </div>
      )}

      {/* Generate Button */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Generating...
            </>
          ) : (
            <>
              <span className="mr-2">🤖</span>
              Generate {currentType?.label}
            </>
          )}
        </button>
        <div className="text-xs text-gray-500">
          Powered by OpenAI
        </div>
      </div>

      {/* Quick Suggestions */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Quick Start Suggestions:</h4>
        <div className="space-y-1">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestion(suggestion)}
              className="block w-full text-left text-xs text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-2 py-1 rounded"
            >
              "{suggestion}"
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIContentGenerator;
