import React from 'react';

const HeaderSection = ({ section, onChange, onDelete, isEditing }) => {
  const { data } = section;

  const handleChange = (field, value) => {
    onChange(section.id, {
      ...data,
      [field]: value
    });
  };

  const handleStyleChange = (styleField, value) => {
    onChange(section.id, {
      ...data,
      style: {
        ...data.style,
        [styleField]: value
      }
    });
  };

  if (!isEditing) {
    return (
      <div className="py-6 mb-6">
        {/* Name Line - Always at the very top, small and clean */}
        {data.showNameLine && (
          <div className="flex justify-end mb-6">
            <div className="text-sm text-gray-700">
              Name: <span className="inline-block w-40 border-b border-gray-400 ml-2"></span>
            </div>
          </div>
        )}
        
        {/* Main Header Content - Centered */}
        <div className="text-center">
          <h1 
            className={`font-bold tracking-wide mb-2 ${
              data.style?.titleFontSize === '2xl' ? 'text-2xl' :
              data.style?.titleFontSize === 'xl' ? 'text-xl' : 'text-lg'
            }`}
            style={{ 
              color: data.style?.color,
              letterSpacing: '0.1em'
            }}
          >
            {data.title}
          </h1>
          
          {data.subtitle && (
            <p className="text-gray-600 text-sm mb-1">
              {data.subtitle}
            </p>
          )}
          
          {data.level && (
            <p className="text-gray-600 text-sm mb-4">
              {data.level}
            </p>
          )}
        </div>

        {/* Bottom Border Line */}
        {data.style?.showBorder && (
          <div className="mt-6">
            <hr className="border-t-2 border-gray-800" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="border-2 border-purple-200 rounded-lg p-4 bg-purple-50">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm font-semibold text-purple-800">Document Header</h3>
        <button
          onClick={() => onDelete(section.id)}
          className="text-red-500 hover:text-red-700 text-sm"
        >
          Delete
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Main Title
          </label>
          <input
            type="text"
            value={data.title}
            onChange={(e) => handleChange('title', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500"
            placeholder="e.g., STUDENT READING"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Subtitle (Course/Module Info)
          </label>
          <input
            type="text"
            value={data.subtitle}
            onChange={(e) => handleChange('subtitle', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500"
            placeholder="e.g., Module 12 | 7th Grade Geography"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Level/Type (Optional)
          </label>
          <input
            type="text"
            value={data.level}
            onChange={(e) => handleChange('level', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500"
            placeholder="e.g., Standard Level, Advanced, etc."
          />
        </div>

        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={data.showNameLine}
              onChange={(e) => handleChange('showNameLine', e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Show name line</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={data.style?.showBorder}
              onChange={(e) => handleStyleChange('showBorder', e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Show bottom border</span>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title Size
            </label>
            <select
              value={data.style?.titleFontSize || 'xl'}
              onChange={(e) => handleStyleChange('titleFontSize', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500"
            >
              <option value="lg">Medium</option>
              <option value="xl">Large</option>
              <option value="2xl">Extra Large</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Color
            </label>
            <input
              type="color"
              value={data.style?.color || '#1f2937'}
              onChange={(e) => handleStyleChange('color', e.target.value)}
              className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
            />
          </div>
        </div>

        {/* Preview in Edit Mode */}
        <div className="mt-4 p-3 bg-white rounded border">
          <div className="text-xs text-gray-500 mb-2">Preview:</div>
          {data.showNameLine && (
            <div className="flex justify-end mb-3">
              <div className="text-xs text-gray-700">
                Name: <span className="inline-block w-24 border-b border-gray-400 ml-1"></span>
              </div>
            </div>
          )}
          <div className="text-center">
            <div className="text-sm font-bold" style={{ color: data.style?.color }}>
              {data.title}
            </div>
            {data.subtitle && <div className="text-xs text-gray-600">{data.subtitle}</div>}
            {data.level && <div className="text-xs text-gray-600">{data.level}</div>}
          </div>
          {data.style?.showBorder && (
            <hr className="border-t border-gray-400 mt-2" />
          )}
        </div>
      </div>
    </div>
  );
};

export default HeaderSection;
