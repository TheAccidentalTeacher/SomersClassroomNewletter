import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useNewsletter } from '../contexts/NewsletterContext';
import { useAuth } from '../contexts/AuthContext';
import SectionRenderer from '../components/editor/SectionRenderer';
import SectionToolbar from '../components/editor/SectionToolbar';
import { createSection, SECTION_TYPES } from '../components/editor/SectionTypes';

const NewsletterEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    currentNewsletter, 
    loading, 
    error, 
    getNewsletter, 
    createNewsletter, 
    updateNewsletter 
  } = useNewsletter();

  const [isEditing, setIsEditing] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [newsletter, setNewsletter] = useState(null);
  const [saving, setSaving] = useState(false);

  // Initialize newsletter content structure
  const initializeNewsletter = useCallback(() => {
    if (id && currentNewsletter) {
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
    } else if (!id) {
      // Creating new newsletter
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
  }, [id, currentNewsletter]);

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
      initializeNewsletter();
    }
  }, [id, getNewsletter, initializeNewsletter]);

  // Initialize newsletter when currentNewsletter changes
  useEffect(() => {
    if (currentNewsletter || !id) {
      initializeNewsletter();
    }
  }, [currentNewsletter, initializeNewsletter, id]);

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
          navigate(`/newsletter-editor/${created.id}`, { replace: true });
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
    </div>
  );
};

export default NewsletterEditor;
