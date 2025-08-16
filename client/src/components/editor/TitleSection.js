import React from 'react';

const TitleSection = ({ section, onChange, onDelete, isEditing }) => {
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
      <div className="text-center py-6">
        <h1 
          className={`font-bold mb-2 ${
            data.style?.fontSize === '3xl' ? 'text-3xl' :
            data.style?.fontSize === '2xl' ? 'text-2xl' : 'text-xl'
          }`}
          style={{ color: data.style?.color }}
        >
          {data.title}
        </h1>
        {data.subtitle && (
          <p className="text-gray-600 text-lg">
            {data.subtitle}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm font-semibold text-blue-800">Title Section</h3>
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Newsletter title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Subtitle (Optional)
          </label>
          <input
            type="text"
            value={data.subtitle}
            onChange={(e) => handleChange('subtitle', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Optional subtitle"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Font Size
            </label>
            <select
              value={data.style?.fontSize || 'xl'}
              onChange={(e) => handleStyleChange('fontSize', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="xl">Large</option>
              <option value="2xl">Extra Large</option>
              <option value="3xl">Huge</option>
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
      </div>
    </div>
  );
};

export default TitleSection;
