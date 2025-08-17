import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNewsletter } from '../contexts/NewsletterContext';
import TemplateGallery from '../components/TemplateGallery';
import ExportControls from '../components/editor/ExportControls';
import ThemeControls from '../components/editor/ThemeControls';
import NewsletterPreview from '../components/NewsletterPreview';

const NewsletterEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentNewsletter, loading, error, getNewsletter, createNewsletter, updateNewsletter } = useNewsletter();

  const [newsletter, setNewsletter] = useState(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('editor');
  const [selectedTheme, setSelectedTheme] = useState('professional');

  useEffect(() => {
    if (id) {
      getNewsletter(id);
    } else {
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
      setNewsletter(currentNewsletter);
      setSelectedTheme(currentNewsletter.theme || 'professional');
    }
  }, [id, currentNewsletter, newsletter]);

  const saveNewsletter = async () => {
    if (!newsletter || saving) return;
    
    try {
      setSaving(true);
      const updatedNewsletter = { ...newsletter, theme: selectedTheme };
      
      if (id) {
        await updateNewsletter(id, updatedNewsletter);
      } else {
        const created = await createNewsletter(updatedNewsletter);
        if (created) {
          navigate(`/editor/${created.id}`, { replace: true });
        }
      }
    } catch (err) {
      console.error('Error saving newsletter:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleTemplateSelect = (template) => {
    setNewsletter(prev => ({
      ...prev,
      title: template.title,
      content: template.content,
      theme: template.theme
    }));
    setSelectedTheme(template.theme);
    setActiveTab('editor');
  };

  if (loading && !newsletter) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600 text-lg">Error: {error}</div>
      </div>
    );
  }

  if (!newsletter) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading newsletter...</div>
      </div>
    );
  }

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
                  onChange={(e) => setNewsletter({...newsletter, title: e.target.value})}
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
                  onChange={(e) => setNewsletter({
                    ...newsletter, 
                    content: {...newsletter.content, text: e.target.value}
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  placeholder="Write your newsletter content here..."
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <button className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm hover:bg-green-200">
                  🤖 AI Assist
                </button>
                <button className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm hover:bg-purple-200">
                  🖼️ Add Image
                </button>
                <button className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm hover:bg-orange-200">
                  � Add Event
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
    </div>
  );
};

export default NewsletterEditor;