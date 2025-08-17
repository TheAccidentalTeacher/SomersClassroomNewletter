import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useNewsletter } from '../contexts/NewsletterContext';
import { useTemplate } from '../contexts/TemplateContext';
import SectionRenderer from '../components/editor/SectionRenderer';
import SectionToolbar from '../components/editor/SectionToolbar';
import ThemeControls from '../components/editor/ThemeControls';
import LayoutControls from '../components/editor/LayoutControls';
import ExportControls from '../components/editor/ExportControls';
import NewsletterPreview from '../components/NewsletterPreview';
import TemplateGallery from '../components/TemplateGallery';
import { createSection, SECTION_TYPES } from '../components/editor/SectionTypes';

const NewsletterEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const previewRef = useRef();
  const { 
    currentNewsletter, 
    loading, 
    error, 
    getNewsletter, 
    createNewsletter, 
    updateNewsletter 
  } = useNewsletter();

  const { createTemplateFromNewsletter } = useTemplate();

  const [viewMode, setViewMode] = useState('edit'); // 'edit', 'preview', 'templates'
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [newsletter, setNewsletter] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showSaveAsTemplate, setShowSaveAsTemplate] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [sidebarTab, setSidebarTab] = useState('sections'); // 'sections', 'theme', 'layout', 'export'
  const [selectedTheme, setSelectedTheme] = useState('professional');

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

  // Handle theme change
  const handleThemeChange = useCallback((newTheme) => {
    setNewsletter(prev => ({
      ...prev,
      content: {
        ...prev.content,
        theme: newTheme
      }
    }));
    setHasUnsavedChanges(true);
  }, []);

  // Handle template selection
  const handleSelectTemplate = useCallback((templateNewsletter) => {
    setNewsletter({
      id: newsletter?.id || null,
      title: templateNewsletter.title,
      content: {
        version: '1.0',
        sections: templateNewsletter.sections || getDefaultSections(),
        theme: templateNewsletter.theme || getDefaultTheme()
      },
      settings: templateNewsletter.settings || {},
      status: 'draft'
    });
    setSelectedTheme(templateNewsletter.theme || 'professional');
    setHasUnsavedChanges(true);
    setViewMode('edit');
  }, [newsletter]);

  // Handle export completion
  const handleExportComplete = useCallback((result) => {
    if (result.success) {
      // Show success notification (you could add a toast system here)
      console.log('Export successful:', result.message);
    } else {
      console.error('Export failed:', result.message);
    }
  }, []);

  // Handle theme change with preview update
  const handleThemeChangeWithPreview = useCallback((newTheme) => {
    handleThemeChange(newTheme);
    setSelectedTheme(newTheme.name || 'professional');
  }, []);

  if (loading && !newsletter) {
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
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <span className="mr-2">←</span>
                Back to Dashboard
              </button>
              
              {newsletter && (
                <div>
                  <input
                    type="text"
                    value={newsletter.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="text-xl font-semibold text-gray-900 bg-transparent border-0 focus:outline-none focus:ring-0 p-0 w-64"
                    placeholder="Newsletter Title"
                  />
                  <div className="flex items-center mt-1 text-sm">
                    {hasUnsavedChanges && !saving && (
                      <span className="text-orange-600 mr-3">• Unsaved changes</span>
                    )}
                    {saving && (
                      <span className="text-blue-600 mr-3">• Saving...</span>
                    )}
                    <span className="text-gray-500">
                      {newsletter.content?.sections?.length || 0} sections
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('templates')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'templates'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                📚 Templates
              </button>
              <button
                onClick={() => setViewMode('edit')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'edit'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                ✏️ Edit
              </button>
              <button
                onClick={() => setViewMode('preview')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'preview'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                👁️ Preview
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowSaveAsTemplate(true)}
                disabled={!newsletter}
                className="flex items-center px-4 py-2 text-sm font-medium text-purple-600 border border-purple-300 rounded-md hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span className="mr-1">⭐</span>
                Save as Template
              </button>

              <button
                onClick={saveNewsletter}
                disabled={saving || !hasUnsavedChanges}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <span className="mr-1">💾</span>
                    {hasUnsavedChanges ? 'Save Changes' : 'Saved'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Template Gallery View */}
        {viewMode === 'templates' && (
          <div className="p-6">
            <TemplateGallery
              onSelectTemplate={handleSelectTemplate}
              currentNewsletter={newsletter}
            />
          </div>
        )}

        {/* Edit Mode */}
        {viewMode === 'edit' && newsletter && (
          <div className="flex">
            {/* Sidebar */}
            <div className="w-80 bg-gray-50 shadow-sm min-h-screen">
              {/* Sidebar Tabs */}
              <div className="bg-white border-b border-gray-200 sticky top-20">
                <div className="flex">
                  <button
                    onClick={() => setSidebarTab('sections')}
                    className={`flex-1 px-3 py-3 text-xs font-medium text-center transition-all ${
                      sidebarTab === 'sections'
                        ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                        : 'text-gray-500 hover:text-gray-700 bg-gray-50'
                    }`}
                  >
                    📝 Sections
                  </button>
                  <button
                    onClick={() => setSidebarTab('theme')}
                    className={`flex-1 px-3 py-3 text-xs font-medium text-center transition-all ${
                      sidebarTab === 'theme'
                        ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                        : 'text-gray-500 hover:text-gray-700 bg-gray-50'
                    }`}
                  >
                    🎨 Theme
                  </button>
                  <button
                    onClick={() => setSidebarTab('layout')}
                    className={`flex-1 px-3 py-3 text-xs font-medium text-center transition-all ${
                      sidebarTab === 'layout'
                        ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                        : 'text-gray-500 hover:text-gray-700 bg-gray-50'
                    }`}
                  >
                    📐 Layout
                  </button>
                  <button
                    onClick={() => setSidebarTab('export')}
                    className={`flex-1 px-3 py-3 text-xs font-medium text-center transition-all ${
                      sidebarTab === 'export'
                        ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                        : 'text-gray-500 hover:text-gray-700 bg-gray-50'
                    }`}
                  >
                    📤 Export
                  </button>
                </div>
              </div>

              {/* Sidebar Content */}
              <div className="h-full overflow-y-auto pb-20">
                {sidebarTab === 'sections' && (
                  <div className="p-4">
                    <SectionToolbar onAddSection={handleAddSection} />
                  </div>
                )}
                
                {sidebarTab === 'theme' && (
                  <div className="p-4">
                    <ThemeControls
                      theme={newsletter.content.theme || getDefaultTheme()}
                      onChange={handleThemeChangeWithPreview}
                      selectedTheme={selectedTheme}
                      onThemeChange={setSelectedTheme}
                    />
                  </div>
                )}

                {sidebarTab === 'layout' && (
                  <div className="p-4">
                    <LayoutControls
                      newsletter={newsletter}
                      onChange={(updatedNewsletter) => {
                        setNewsletter(updatedNewsletter);
                        setHasUnsavedChanges(true);
                      }}
                    />
                  </div>
                )}

                {sidebarTab === 'export' && (
                  <div className="p-4">
                    <ExportControls
                      previewRef={previewRef}
                      newsletter={newsletter}
                      onExportComplete={handleExportComplete}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Main Editor */}
            <div className="flex-1 bg-gray-100 min-h-screen">
              <div className="p-8">
                <div className="bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
                  <div 
                    className="min-h-screen p-8"
                    style={{ 
                      backgroundColor: newsletter?.content?.theme?.backgroundColor || '#ffffff',
                      fontFamily: newsletter?.content?.theme?.fontFamily || 'Inter, sans-serif'
                    }}
                  >
                    <DragDropContext onDragEnd={handleDragEnd}>
                      <Droppable droppableId="newsletter-sections">
                        {(provided, snapshot) => (
                          <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className={`${
                              snapshot.isDraggingOver ? 'bg-blue-50/50 rounded-lg' : ''
                            } space-y-6`}
                          >
                            {sortedSections.map((section, index) => (
                              <Draggable
                                key={section.id}
                                draggableId={section.id}
                                index={index}
                              >
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    className={`${
                                      snapshot.isDragging ? 'opacity-75 rotate-2' : ''
                                    } transition-all`}
                                  >
                                    <div
                                      {...provided.dragHandleProps}
                                      className="flex items-center justify-center w-full py-2 text-gray-400 hover:text-gray-600 cursor-move"
                                    >
                                      <div className="flex space-x-1">
                                        <div className="w-1 h-1 bg-current rounded-full"></div>
                                        <div className="w-1 h-1 bg-current rounded-full"></div>
                                        <div className="w-1 h-1 bg-current rounded-full"></div>
                                        <div className="w-1 h-1 bg-current rounded-full"></div>
                                        <div className="w-1 h-1 bg-current rounded-full"></div>
                                        <div className="w-1 h-1 bg-current rounded-full"></div>
                                      </div>
                                    </div>
                                    
                                    <SectionRenderer
                                      section={section}
                                      onChange={handleSectionChange}
                                      onDelete={handleSectionDelete}
                                      isEditing={true}
                                      theme={newsletter.content.theme || getDefaultTheme()}
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
        )}

        {/* Preview Mode */}
        {viewMode === 'preview' && newsletter && (
          <div className="bg-gray-100 min-h-screen p-8">
            <div className="max-w-5xl mx-auto">
              <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    📋 Newsletter Preview
                  </h2>
                  <div className="flex items-center space-x-3 text-sm text-gray-600">
                    <span>Theme: <strong className="capitalize">{selectedTheme}</strong></span>
                    <span>•</span>
                    <span>Sections: <strong>{newsletter.content?.sections?.length || 0}</strong></span>
                    <span>•</span>
                    <button
                      onClick={() => setSidebarTab('export')}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Export Options →
                    </button>
                  </div>
                </div>
              </div>
              
              <NewsletterPreview
                ref={previewRef}
                newsletter={{
                  ...newsletter,
                  sections: newsletter.content?.sections || []
                }}
                theme={selectedTheme}
              />
            </div>
          </div>
        )}
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
