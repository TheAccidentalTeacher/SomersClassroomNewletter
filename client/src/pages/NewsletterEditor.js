import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNewsletter } from '../contexts/NewsletterContext';
import TemplateGallery from '../components/TemplateGallery';
import ExportControls from '../components/editor/ExportControls';
import ThemeControls from '../components/editor/ThemeControls';
import NewsletterPreview from '../components/NewsletterPreview';
import AIContentGenerator from '../components/editor/AIContentGenerator';
import ImageBrowser from '../components/editor/ImageBrowser';
import DebugConsole from '../components/DebugConsole';
import debugLogger from '../utils/debugLogger';

const NewsletterEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentNewsletter, loading, error, getNewsletter, createNewsletter, updateNewsletter } = useNewsletter();

  const [newsletter, setNewsletter] = useState(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('editor');
  const [selectedTheme, setSelectedTheme] = useState('professional');
  
  // Modal states
  const [showAIModal, setShowAIModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showDebugConsole, setShowDebugConsole] = useState(false);

  useEffect(() => {
    if (id) {
      debugLogger.info('Loading existing newsletter', { id });
      getNewsletter(id);
    } else {
      debugLogger.info('Creating new newsletter');
      setNewsletter({
        title: 'New Newsletter',
        content: { text: '' },
        status: 'draft',
        theme: 'professional'
      });
    }
  }, [id, getNewsletter]);

  useEffect(() => {
    if (id && currentNewsletter && !newsletter) {
      debugLogger.success('Newsletter loaded successfully', { 
        id, 
        title: currentNewsletter.title,
        theme: currentNewsletter.theme 
      });
      setNewsletter(currentNewsletter);
      setSelectedTheme(currentNewsletter.theme || 'professional');
    }
  }, [id, currentNewsletter, newsletter]);

  // F12 debug console toggle
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'F12') {
        event.preventDefault();
        setShowDebugConsole(prev => {
          debugLogger.user('Debug console toggled', { isOpen: !prev });
          return !prev;
        });
      }
      // Ctrl + D for debug console
      if (event.ctrlKey && event.key === 'd') {
        event.preventDefault();
        setShowDebugConsole(prev => {
          debugLogger.user('Debug console toggled via Ctrl+D', { isOpen: !prev });
          return !prev;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const saveNewsletter = async () => {
    if (!newsletter || saving) {
      debugLogger.warn('Save attempted but newsletter not ready', { newsletter: !!newsletter, saving });
      return;
    }
    
    try {
      setSaving(true);
      debugLogger.info('Saving newsletter', { 
        id, 
        title: newsletter.title, 
        theme: selectedTheme,
        contentLength: newsletter.content?.text?.length || 0
      });
      
      const updatedNewsletter = { ...newsletter, theme: selectedTheme };
      
      if (id) {
        await updateNewsletter(id, updatedNewsletter);
        debugLogger.success('Newsletter updated successfully', { id });
      } else {
        const created = await createNewsletter(updatedNewsletter);
        if (created) {
          debugLogger.success('Newsletter created successfully', { newId: created.id });
          navigate(`/editor/${created.id}`, { replace: true });
        }
      }
    } catch (err) {
      debugLogger.error('Error saving newsletter', { error: err.message, stack: err.stack });
      console.error('Error saving newsletter:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleTemplateSelect = (template) => {
    debugLogger.user('Template selected', { 
      templateTitle: template.title, 
      templateTheme: template.theme 
    });
    setNewsletter(prev => ({
      ...prev,
      title: template.title,
      content: template.content,
      theme: template.theme
    }));
    setSelectedTheme(template.theme);
    setActiveTab('editor');
  };

  // AI Content Generation Handler
  const handleAIContentGenerated = (generatedContent) => {
    debugLogger.success('AI content generated', { 
      contentLength: generatedContent?.length || 0,
      contentPreview: generatedContent?.substring(0, 100) + '...' 
    });
    setNewsletter(prev => ({
      ...prev,
      content: {
        ...prev.content,
        text: (prev.content?.text || '') + '\n\n' + generatedContent
      }
    }));
    setShowAIModal(false);
  };

  // Image Selection Handler
  const handleImageSelect = (imageUrl) => {
    debugLogger.user('Image selected', { imageUrl });
    const imageMarkdown = `\n\n![Image](${imageUrl})\n\n`;
    setNewsletter(prev => ({
      ...prev,
      content: {
        ...prev.content,
        text: (prev.content?.text || '') + imageMarkdown
      }
    }));
    setShowImageModal(false);
  };

  // Add Event Handler
  const handleAddEvent = () => {
    debugLogger.user('Event template added to newsletter');
    const eventTemplate = `\n\n📅 **Upcoming Event**
Date: [Event Date]
Title: [Event Title]
Description: [Event Description]
\n\n`;
    
    setNewsletter(prev => ({
      ...prev,
      content: {
        ...prev.content,
        text: (prev.content?.text || '') + eventTemplate
      }
    }));
  };

  // Button click handlers with debugging
  const handleAIAssistClick = () => {
    debugLogger.user('AI Assist button clicked');
    setShowAIModal(true);
  };

  const handleAddImageClick = () => {
    debugLogger.user('Add Image button clicked');
    setShowImageModal(true);
  };

  const handleAddEventClick = () => {
    debugLogger.user('Add Event button clicked');
    handleAddEvent();
  };

  if (loading && !newsletter) {
    debugLogger.info('Loading newsletter...');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (error) {
    debugLogger.error('Newsletter loading error', { error });
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600 text-lg">Error: {error}</div>
      </div>
    );
  }

  if (!newsletter) {
    debugLogger.warn('Newsletter not found or not loaded');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading newsletter...</div>
      </div>
    );
  }

  debugLogger.info('Rendering newsletter editor', { 
    newsletterTitle: newsletter.title,
    activeTab,
    theme: selectedTheme 
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
            >
              ← Back to Dashboard
            </button>
            
            <h1 className="text-xl font-semibold">
              Professional Newsletter Editor
            </h1>
            
            <div className="flex items-center gap-3">
              <button
                onClick={saveNewsletter}
                disabled={saving}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-400 flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  '💾 Save'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex space-x-8">
            {[
              { id: 'templates', label: '🎨 Templates', icon: '🎨' },
              { id: 'editor', label: '✏️ Editor', icon: '✏️' },
              { id: 'themes', label: '🎭 Themes', icon: '🎭' },
              { id: 'preview', label: '👀 Preview', icon: '👀' },
              { id: 'export', label: '📤 Export', icon: '📤' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {activeTab === 'templates' && (
          <TemplateGallery onSelectTemplate={handleTemplateSelect} />
        )}

        {activeTab === 'editor' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Editor Panel */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">📝 Content Editor</h2>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Newsletter Title
                </label>
                <input
                  type="text"
                  value={newsletter.title || ''}
                  onChange={(e) => {
                    debugLogger.user('Newsletter title changed', { newTitle: e.target.value });
                    setNewsletter({...newsletter, title: e.target.value});
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter newsletter title..."
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content
                </label>
                <textarea
                  rows={12}
                  value={newsletter.content?.text || ''}
                  onChange={(e) => {
                    debugLogger.debug('Newsletter content changed', { 
                      contentLength: e.target.value.length,
                      linesChanged: e.target.value.split('\n').length
                    });
                    setNewsletter({
                      ...newsletter, 
                      content: {...newsletter.content, text: e.target.value}
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  placeholder="Write your newsletter content here..."
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={handleAIAssistClick}
                  className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm hover:bg-green-200 transition-colors"
                >
                  🤖 AI Assist
                </button>
                <button 
                  onClick={handleAddImageClick}
                  className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm hover:bg-purple-200 transition-colors"
                >
                  🖼️ Add Image
                </button>
                <button 
                  onClick={handleAddEventClick}
                  className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm hover:bg-orange-200 transition-colors"
                >
                  📅 Add Event
                </button>
              </div>
            </div>

            {/* Live Preview Panel */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">👁️ Live Preview</h2>
              <NewsletterPreview newsletter={newsletter} theme={selectedTheme} />
            </div>
          </div>
        )}

        {activeTab === 'themes' && (
          <ThemeControls
            selectedTheme={selectedTheme}
            onThemeChange={setSelectedTheme}
          />
        )}

        {activeTab === 'preview' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">📧 Full Preview</h2>
            <NewsletterPreview newsletter={newsletter} theme={selectedTheme} fullSize={true} />
          </div>
        )}

        {activeTab === 'export' && (
          <ExportControls newsletter={newsletter} theme={selectedTheme} />
        )}
      </div>

      {/* AI Content Generation Modal */}
      {showAIModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">🤖 AI Content Generator</h3>
              <button
                onClick={() => setShowAIModal(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>
            <div className="p-4">
              <AIContentGenerator
                onContentGenerated={handleAIContentGenerated}
                existingContent={newsletter.content?.text || ''}
              />
            </div>
          </div>
        </div>
      )}

      {/* Image Browser Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">🖼️ Image Browser</h3>
              <button
                onClick={() => setShowImageModal(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>
            <div className="p-4">
              <ImageBrowser
                onImageSelect={handleImageSelect}
                onClose={() => setShowImageModal(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Debug Console */}
      <DebugConsole 
        isOpen={showDebugConsole} 
        onClose={() => setShowDebugConsole(false)} 
      />

      {/* Floating Debug Button */}
      <button
        onClick={() => setShowDebugConsole(true)}
        className="fixed bottom-4 right-4 bg-gray-800 text-white p-3 rounded-full shadow-lg hover:bg-gray-700 z-40"
        title="Open Debug Console (F12 or Ctrl+D)"
      >
        🐛
      </button>
    </div>
  );
};

export default NewsletterEditor;