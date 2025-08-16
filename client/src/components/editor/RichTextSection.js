import React from 'react';

const RichTextSection = ({ section, onChange, onDelete, isEditing }) => {
  const { data } = section;

  const handleChange = (field, value) => {
    onChange(section.id, {
      ...data,
      [field]: value
    });
  };

  if (!isEditing) {
    return (
      <div className="py-4">
        <div 
          className={`prose max-w-none ${
            data.style?.textAlign === 'center' ? 'text-center' :
            data.style?.textAlign === 'right' ? 'text-right' : 'text-left'
          }`}
          style={{ fontSize: data.style?.fontSize === 'sm' ? '14px' : data.style?.fontSize === 'lg' ? '18px' : '16px' }}
        >
          {data.content.split('\n').map((paragraph, index) => (
            <p key={index} className="mb-3">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="border-2 border-green-200 rounded-lg p-4 bg-green-50">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm font-semibold text-green-800">Text Content</h3>
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
            Content
          </label>
          <textarea
            value={data.content}
            onChange={(e) => handleChange('content', e.target.value)}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
            placeholder="Enter your content here..."
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Text Alignment
            </label>
            <select
              value={data.style?.textAlign || 'left'}
              onChange={(e) => handleChange('style', { ...data.style, textAlign: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Font Size
            </label>
            <select
              value={data.style?.fontSize || 'base'}
              onChange={(e) => handleChange('style', { ...data.style, fontSize: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
            >
              <option value="sm">Small</option>
              <option value="base">Normal</option>
              <option value="lg">Large</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RichTextSection;
