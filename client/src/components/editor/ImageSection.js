import React, { useState } from 'react';
import ImageBrowser from './ImageBrowser';

const ImageSection = ({ 
  section, 
  onUpdate, 
  onDelete, 
  isEditing, 
  onEdit,
  theme = 'default'
}) => {
  const [showImageBrowser, setShowImageBrowser] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageSelect = (imageData) => {
    const updatedSection = {
      ...section,
      imageUrl: imageData.url,
      imageAlt: imageData.description,
      imageCredit: {
        photographer: imageData.photographer,
        photographerUrl: imageData.photographerUrl,
        provider: imageData.provider,
        webUrl: imageData.webUrl
      },
      imageWidth: imageData.width,
      imageHeight: imageData.height
    };
    onUpdate(updatedSection);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageError(false);
  };

  const handleCaptionChange = (caption) => {
    onUpdate({
      ...section,
      caption: caption
    });
  };

  const handleLayoutChange = (layout) => {
    onUpdate({
      ...section,
      layout: layout
    });
  };

  const handleSizeChange = (size) => {
    onUpdate({
      ...section,
      size: size
    });
  };

  const handleAlignmentChange = (alignment) => {
    onUpdate({
      ...section,
      alignment: alignment
    });
  };

  const themeStyles = {
    default: {
      container: 'bg-white border border-gray-200',
      title: 'text-gray-800',
      text: 'text-gray-600'
    },
    professional: {
      container: 'bg-gray-50 border border-gray-300',
      title: 'text-gray-900',
      text: 'text-gray-700'
    },
    colorful: {
      container: 'bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200',
      title: 'text-blue-900',
      text: 'text-blue-800'
    },
    minimal: {
      container: 'bg-white border-l-4 border-gray-400',
      title: 'text-gray-800',
      text: 'text-gray-600'
    }
  };

  const currentTheme = themeStyles[theme] || themeStyles.default;

  return (
    <div className={`p-4 rounded-lg ${currentTheme.container} relative group`}>
      {/* Edit Controls */}
      {isEditing && (
        <div className="absolute top-2 right-2 flex space-x-1 bg-white rounded shadow-lg border p-1">
          <button
            onClick={() => setShowImageBrowser(true)}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
            title="Browse Images"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>
          <button
            onClick={() => onEdit(false)}
            className="p-1 text-green-600 hover:bg-green-50 rounded"
            title="Finish Editing"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </button>
          <button
            onClick={onDelete}
            className="p-1 text-red-600 hover:bg-red-50 rounded"
            title="Delete Section"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      )}

      {/* Non-editing controls */}
      {!isEditing && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(true)}
            className="p-1 bg-white text-gray-600 hover:text-blue-600 rounded shadow border"
            title="Edit Image"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        </div>
      )}

      {/* Image Content */}
      {section.imageUrl ? (
        <div className={`text-${section.alignment || 'center'}`}>
          <div 
            className={`inline-block ${
              section.size === 'small' ? 'max-w-xs' :
              section.size === 'large' ? 'max-w-full' :
              'max-w-md'
            } w-full`}
          >
            {imageError ? (
              <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <div className="text-gray-400 text-4xl mb-2">⚠️</div>
                <p className="text-gray-600 mb-2">Image failed to load</p>
                <p className="text-sm text-gray-500 mb-4">{section.imageAlt}</p>
                <button
                  onClick={() => setShowImageBrowser(true)}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Choose Different Image
                </button>
              </div>
            ) : (
              <img
                src={section.imageUrl}
                alt={section.imageAlt || 'Newsletter image'}
                onError={handleImageError}
                onLoad={handleImageLoad}
                className={`w-full h-auto rounded-lg shadow-sm ${
                  section.layout === 'rounded' ? 'rounded-xl' :
                  section.layout === 'circle' ? 'rounded-full aspect-square object-cover' :
                  ''
                }`}
              />
            )}
            
            {/* Caption */}
            {(section.caption || isEditing) && (
              <div className="mt-2">
                {isEditing ? (
                  <input
                    type="text"
                    value={section.caption || ''}
                    onChange={(e) => handleCaptionChange(e.target.value)}
                    placeholder="Add image caption (optional)"
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  section.caption && (
                    <p className={`text-sm italic ${currentTheme.text}`}>
                      {section.caption}
                    </p>
                  )
                )}
              </div>
            )}

            {/* Image Credit */}
            {section.imageCredit && (
              <div className="mt-1">
                <p className="text-xs text-gray-400">
                  Photo by{' '}
                  <a
                    href={section.imageCredit.photographerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    {section.imageCredit.photographer}
                  </a>
                  {' '}on{' '}
                  <a
                    href={section.imageCredit.webUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline capitalize"
                  >
                    {section.imageCredit.provider}
                  </a>
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        // Placeholder when no image
        <div className="text-center py-8">
          <div className="text-gray-300 text-6xl mb-4">🖼️</div>
          <p className={`mb-4 ${currentTheme.text}`}>
            {isEditing ? 'Click "Browse Images" to add an image' : 'No image selected'}
          </p>
          {isEditing && (
            <button
              onClick={() => setShowImageBrowser(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Browse Images
            </button>
          )}
        </div>
      )}

      {/* Editing Controls */}
      {isEditing && section.imageUrl && (
        <div className="mt-4 space-y-3 border-t pt-4">
          {/* Size Control */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image Size
            </label>
            <div className="flex space-x-2">
              {['small', 'medium', 'large'].map((size) => (
                <button
                  key={size}
                  onClick={() => handleSizeChange(size)}
                  className={`px-3 py-1 text-sm rounded ${
                    (section.size || 'medium') === size
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {size.charAt(0).toUpperCase() + size.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Alignment Control */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alignment
            </label>
            <div className="flex space-x-2">
              {[
                { key: 'left', label: 'Left', icon: '⬅️' },
                { key: 'center', label: 'Center', icon: '⬆️' },
                { key: 'right', label: 'Right', icon: '➡️' }
              ].map((align) => (
                <button
                  key={align.key}
                  onClick={() => handleAlignmentChange(align.key)}
                  className={`px-3 py-1 text-sm rounded ${
                    (section.alignment || 'center') === align.key
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  title={align.label}
                >
                  {align.icon}
                </button>
              ))}
            </div>
          </div>

          {/* Layout Control */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Style
            </label>
            <div className="flex space-x-2">
              {[
                { key: 'default', label: 'Default' },
                { key: 'rounded', label: 'Rounded' },
                { key: 'circle', label: 'Circle' }
              ].map((layout) => (
                <button
                  key={layout.key}
                  onClick={() => handleLayoutChange(layout.key)}
                  className={`px-3 py-1 text-sm rounded ${
                    (section.layout || 'default') === layout.key
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {layout.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Image Browser Modal */}
      {showImageBrowser && (
        <ImageBrowser
          onImageSelect={handleImageSelect}
          onClose={() => setShowImageBrowser(false)}
          initialQuery=""
          contentType="general"
        />
      )}
    </div>
  );
};

export default ImageSection;
