import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTemplate } from '../contexts/TemplateContext';
import { useNewsletter } from '../contexts/NewsletterContext';

const Templates = () => {
  const navigate = useNavigate();
  const { 
    templates, 
    loading, 
    error, 
    stats,
    fetchTemplates,
    fetchPublicTemplates,
    fetchMyTemplates,
    deleteTemplate,
    duplicateTemplate,
    clearError 
  } = useTemplate();

  const { createNewsletter } = useNewsletter();

  const [activeTab, setActiveTab] = useState('all'); // 'all', 'my', 'public'
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Load templates on mount and tab change
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        switch (activeTab) {
          case 'my':
            await fetchMyTemplates();
            break;
          case 'public':
            await fetchPublicTemplates();
            break;
          default:
            await fetchTemplates();
        }
      } catch (error) {
        console.error('Error loading templates:', error);
      }
    };

    loadTemplates();
  }, [activeTab, fetchTemplates, fetchMyTemplates, fetchPublicTemplates]);

  // Handle creating newsletter from template
  const handleCreateFromTemplate = async (template) => {
    try {
      const newsletterData = {
        title: `Newsletter from ${template.name}`,
        content: template.content,
        settings: template.settings,
        status: 'draft'
      };

      const newNewsletter = await createNewsletter(newsletterData);
      if (newNewsletter) {
        navigate(`/editor/${newNewsletter.id}`);
      }
    } catch (error) {
      console.error('Error creating newsletter from template:', error);
    }
  };

  // Handle template deletion
  const handleDeleteTemplate = async (templateId) => {
    try {
      await deleteTemplate(templateId);
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  };

  // Handle template duplication
  const handleDuplicateTemplate = async (templateId) => {
    try {
      await duplicateTemplate(templateId);
    } catch (error) {
      console.error('Error duplicating template:', error);
    }
  };

  // Template preview modal
  const TemplatePreview = ({ template, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-xl font-semibold">{template.name}</h3>
            <p className="text-gray-600">{template.description}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>
        
        <div className="border rounded-lg p-4 bg-gray-50">
          <div className="text-sm text-gray-500 mb-2">Template Preview:</div>
          {/* Render template sections */}
          <div className="space-y-4">
            {template.content?.sections?.map((section, index) => (
              <div key={section.id || index} className="bg-white p-4 rounded border">
                <div className="text-xs text-gray-400 mb-2 uppercase">
                  {section.type} Section
                </div>
                {section.type === 'title' && (
                  <h2 className="text-2xl font-bold">{section.data?.title || 'Title'}</h2>
                )}
                {section.type === 'richText' && (
                  <div className="prose">{section.data?.content || 'Rich text content...'}</div>
                )}
                {section.type === 'events' && (
                  <div>
                    <h3 className="font-semibold mb-2">{section.data?.title || 'Events'}</h3>
                    <div className="text-sm text-gray-600">
                      {section.data?.events?.length || 0} event(s)
                    </div>
                  </div>
                )}
                {section.type === 'contact' && (
                  <div>
                    <h3 className="font-semibold mb-2">{section.data?.title || 'Contact'}</h3>
                    <div className="text-sm text-gray-600">
                      {section.data?.teacherName || 'Teacher Name'}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
          >
            Close
          </button>
          <button
            onClick={() => {
              handleCreateFromTemplate(template);
              onClose();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Use Template
          </button>
        </div>
      </div>
    </div>
  );

  // Template card component
  const TemplateCard = ({ template }) => {
    const isOwner = template.userId === templates?.[0]?.userId; // Simple check for ownership
    
    return (
      <div className="bg-white rounded-lg border hover:shadow-md transition-shadow">
        <div className="p-4">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="font-semibold text-lg">{template.name}</h3>
              {template.description && (
                <p className="text-gray-600 text-sm mt-1">{template.description}</p>
              )}
            </div>
            <div className="flex items-center space-x-1">
              {template.isGlobal && (
                <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                  Global
                </span>
              )}
              {template.isPublic && (
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                  Public
                </span>
              )}
              {!template.isPublic && !template.isGlobal && (
                <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                  Private
                </span>
              )}
            </div>
          </div>

          <div className="text-sm text-gray-500 mb-4">
            {template.content?.sections?.length || 0} sections • 
            Updated {new Date(template.updatedAt).toLocaleDateString()}
          </div>

          <div className="flex justify-between items-center">
            <button
              onClick={() => {
                setSelectedTemplate(template);
                setShowPreview(true);
              }}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Preview
            </button>

            <div className="flex space-x-2">
              <button
                onClick={() => handleCreateFromTemplate(template)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
              >
                Use Template
              </button>

              <button
                onClick={() => handleDuplicateTemplate(template.id)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm"
              >
                Duplicate
              </button>

              {isOwner && (
                <button
                  onClick={() => setDeleteConfirm(template.id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading && templates.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Templates</h1>
            <p className="text-gray-600 mt-2">
              Create newsletters faster with reusable templates
            </p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            Back to Dashboard
          </button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white p-6 rounded-lg border">
              <div className="text-2xl font-bold text-blue-600">{stats.total || 0}</div>
              <div className="text-gray-600">Total Templates</div>
            </div>
            <div className="bg-white p-6 rounded-lg border">
              <div className="text-2xl font-bold text-green-600">{stats.public_templates || 0}</div>
              <div className="text-gray-600">Public Templates</div>
            </div>
            <div className="bg-white p-6 rounded-lg border">
              <div className="text-2xl font-bold text-purple-600">{stats.private_templates || 0}</div>
              <div className="text-gray-600">Private Templates</div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('all')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'all'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              All Templates
            </button>
            <button
              onClick={() => setActiveTab('my')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'my'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Templates
            </button>
            <button
              onClick={() => setActiveTab('public')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'public'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Public Templates
            </button>
          </nav>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="text-red-800">{error}</div>
            <button
              onClick={clearError}
              className="text-red-600 hover:text-red-800 text-sm mt-2"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Templates Grid */}
        {templates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map(template => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-xl mb-4">📄</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
            <p className="text-gray-600 mb-6">
              {activeTab === 'my' 
                ? "You haven't created any templates yet. Create a newsletter and save it as a template!" 
                : "No templates available in this category."}
            </p>
            <button
              onClick={() => navigate('/editor')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            >
              Create Newsletter
            </button>
          </div>
        )}

        {/* Loading state for additional templates */}
        {loading && templates.length > 0 && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading more templates...</p>
          </div>
        )}

        {/* Preview Modal */}
        {showPreview && selectedTemplate && (
          <TemplatePreview 
            template={selectedTemplate} 
            onClose={() => {
              setShowPreview(false);
              setSelectedTemplate(null);
            }}
          />
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md">
              <h3 className="text-lg font-semibold mb-4">Delete Template</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this template? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteTemplate(deleteConfirm)}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Templates;
