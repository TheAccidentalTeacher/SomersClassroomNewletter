import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useNewsletter } from '../contexts/NewsletterContext';
import { useTemplate } from '../contexts/TemplateContext';
import { useAuth } from '../contexts/AuthContext';
import SectionRenderer from '../components/editor/SectionRenderer';
import SectionToolbar from '../components/editor/SectionToolbar';
import { createSection, SECTION_TYPES } from '../components/editor/SectionTypes';

const NewsletterEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    currentNewsletter, 
    loading, 
    error, 
    getNewsletter, 
    createNewsletter, 
    updateNewsletter 
  } = useNewsletter();

  const { createTemplateFromNewsletter } = useTemplate();

  const [isEditing, setIsEditing] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [newsletter, setNewsletter] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showSaveAsTemplate, setShowSaveAsTemplate] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');

  const getDefaultSections = () => [
    createSection(SECTION_TYPES.TITLE, 0),
    createSection(SECTION_TYPES.RICH_TEXT, 1),
    createSection(SECTION_TYPES.EVENTS, 2),
    createSection(SECTION_TYPES.CONTACT, 3)
  ];

  const getDefaultTheme = () => ({
    primaryColor: '#3b82f6',
    backgroundColor: '#ffffff',
    fontFamily: 'Inter, sans-serif'
  });

  // Load newsletter data
  useEffect(() => {
    if (id) {
      getNewsletter(id);
    } else {
      // Creating new newsletter - initialize directly
      setNewsletter({
        title: 'Untitled Newsletter',
        content: {
          version: '1.0',
          sections: getDefaultSections(),
          theme: getDefaultTheme()
        },
        settings: {},
        status: 'draft'
      });
    }
  }, [id, getNewsletter]);

  // Initialize newsletter when currentNewsletter loads (only for existing newsletters)
  useEffect(() => {
    if (id && currentNewsletter && !newsletter) {
      // Editing existing newsletter
      const content = currentNewsletter.content || {};
      const sections = content.sections || [];
      
      setNewsletter({
        ...currentNewsletter,
        content: {
          version: '1.0',
          sections: sections.length > 0 ? sections : getDefaultSections(),
          theme: content.theme || getDefaultTheme()
        }
      });
    }
  }, [id, currentNewsletter, newsletter]);

  // Save function with debounce
  const saveNewsletter = useCallback(async () => {
    if (!newsletter || saving) return;

    try {
      setSaving(true);
      
      if (id) {
        // Update existing
        await updateNewsletter(id, newsletter);
      } else {
        // Create new
        const created = await createNewsletter(newsletter);
        if (created) {
          navigate(`/editor/${created.id}`, { replace: true });
        }
      }
      
      setHasUnsavedChanges(false);
    } catch (err) {
      console.error('Error saving newsletter:', err);
    } finally {
      setSaving(false);
    }
  }, [newsletter, saving, id, updateNewsletter, createNewsletter, navigate]);

  // Auto-save with debounce
  useEffect(() => {
    if (hasUnsavedChanges && newsletter) {
      const timeoutId = setTimeout(() => {
        saveNewsletter();
      }, 2000);

      return () => clearTimeout(timeoutId);
    }
  }, [hasUnsavedChanges, newsletter, saveNewsletter]);

  // Handle section changes
  const handleSectionChange = useCallback((sectionId, newData) => {
    setNewsletter(prev => ({
      ...prev,
      content: {
        ...prev.content,
        sections: prev.content.sections.map(section =>
          section.id === sectionId 
            ? { ...section, data: newData }
            : section
        )
      }
    }));
    setHasUnsavedChanges(true);
  }, []);

  // Handle section deletion
  const handleSectionDelete = useCallback((sectionId) => {
    setNewsletter(prev => ({
      ...prev,
      content: {
        ...prev.content,
        sections: prev.content.sections.filter(section => section.id !== sectionId)
      }
    }));
    setHasUnsavedChanges(true);
  }, []);

  // Handle adding new section
  const handleAddSection = useCallback((newSection) => {
    setNewsletter(prev => {
      const maxOrder = Math.max(...prev.content.sections.map(s => s.order), -1);
      return {
        ...prev,
        content: {
          ...prev.content,
          sections: [...prev.content.sections, { ...newSection, order: maxOrder + 1 }]
        }
      };
    });
    setHasUnsavedChanges(true);
  }, []);

  // Handle drag and drop
  const handleDragEnd = useCallback((result) => {
    if (!result.destination) return;

    const { source, destination } = result;
    if (source.index === destination.index) return;

    setNewsletter(prev => {
      const newSections = Array.from(prev.content.sections);
      const [reorderedSection] = newSections.splice(source.index, 1);
      newSections.splice(destination.index, 0, reorderedSection);

      // Update order values
      const sectionsWithNewOrder = newSections.map((section, index) => ({
        ...section,
        order: index
      }));

      return {
        ...prev,
        content: {
          ...prev.content,
          sections: sectionsWithNewOrder
        }
      };
    });
    
    setHasUnsavedChanges(true);
  }, []);

  // Handle title change
  const handleTitleChange = useCallback((newTitle) => {
    setNewsletter(prev => ({
      ...prev,
      title: newTitle
    }));
    setHasUnsavedChanges(true);
  }, []);

  // Handle save as template
  const handleSaveAsTemplate = useCallback(async () => {
    if (!newsletter) return;

    try {
      const templateData = {
        name: templateName || `${newsletter.title} Template`,
        description: templateDescription || `Template created from newsletter: ${newsletter.title}`,
        content: newsletter.content,
        settings: newsletter.settings || {},
        isPublic: false
      };

      await createTemplateFromNewsletter(templateData);
      setShowSaveAsTemplate(false);
      setTemplateName('');
      setTemplateDescription('');
      
      // Show success message (you could add a toast here)
      alert('Template saved successfully!');
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Error saving template. Please try again.');
    }
  }, [newsletter, templateName, templateDescription, createTemplateFromNewsletter]);

  if (loading && !newsletter) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading newsletter...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!newsletter) {
    return <div>Loading...</div>;
  }

  const sortedSections = [...newsletter.content.sections].sort((a, b) => a.order - b.order);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-gray-600 hover:text-gray-900"
              >
                ← Back to Dashboard
              </button>
              <div>
                <input
                  type="text"
                  value={newsletter.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="text-xl font-semibold text-gray-900 bg-transparent border-0 focus:outline-none focus:ring-0 p-0"
                  placeholder="Newsletter Title"
                />
                {hasUnsavedChanges && !saving && (
                  <p className="text-sm text-orange-600">Unsaved changes</p>
                )}
                {saving && (
                  <p className="text-sm text-blue-600">Saving...</p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`px-4 py-2 rounded-md font-medium ${
                  isEditing 
                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isEditing ? 'Preview' : 'Edit'}
              </button>

              <button
                onClick={() => setShowSaveAsTemplate(true)}
                disabled={!newsletter}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-4 py-2 rounded-md font-medium"
              >
                Save as Template
              </button>

              <button
                onClick={saveNewsletter}
                disabled={saving}
                className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-md font-medium"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="flex">
          {/* Sidebar */}
          {isEditing && (
            <div className="w-80 bg-white shadow-sm">
              <SectionToolbar onAddSection={handleAddSection} />
            </div>
          )}

          {/* Main Editor */}
          <div className={`flex-1 ${isEditing ? 'ml-0' : ''}`}>
            <div className="bg-white min-h-screen">
              <div className="max-w-4xl mx-auto p-8">
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="newsletter-sections" isDropDisabled={!isEditing}>
                    {(provided, snapshot) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={`space-y-6 ${snapshot.isDraggingOver ? 'bg-blue-50' : ''}`}
                      >
                        {sortedSections.map((section, index) => (
                          <Draggable
                            key={section.id}
                            draggableId={section.id}
                            index={index}
                            isDragDisabled={!isEditing}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`${
                                  snapshot.isDragging ? 'opacity-75' : ''
                                } ${isEditing ? 'cursor-move' : ''}`}
                              >
                                {isEditing && (
                                  <div
                                    {...provided.dragHandleProps}
                                    className="flex items-center justify-center w-full py-2 text-gray-400 hover:text-gray-600 cursor-move"
                                  >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                    </svg>
                                  </div>
                                )}
                                
                                <SectionRenderer
                                  section={section}
                                  onChange={handleSectionChange}
                                  onDelete={handleSectionDelete}
                                  isEditing={isEditing}
                                />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save as Template Modal */}
      {showSaveAsTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Save as Template</h3>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="templateName" className="block text-sm font-medium text-gray-700 mb-1">
                  Template Name *
                </label>
                <input
                  type="text"
                  id="templateName"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder={`${newsletter?.title || 'Newsletter'} Template`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="templateDescription" className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  id="templateDescription"
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  placeholder={`Template created from newsletter: ${newsletter?.title || 'Newsletter'}`}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="bg-blue-50 p-3 rounded-md">
                <div className="text-sm text-blue-800">
                  <div className="font-medium mb-1">Template will include:</div>
                  <ul className="text-xs space-y-1">
                    <li>• {newsletter?.content?.sections?.length || 0} sections</li>
                    <li>• Current layout and styling</li>
                    <li>• Section structure and types</li>
                  </ul>
                  <div className="mt-2 text-xs text-blue-600">
                    Template will be saved as private by default.
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowSaveAsTemplate(false);
                  setTemplateName('');
                  setTemplateDescription('');
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAsTemplate}
                disabled={!newsletter}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-purple-400"
              >
                Save Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsletterEditor;
