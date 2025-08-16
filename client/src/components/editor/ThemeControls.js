import React from 'react';

const ThemeControls = ({ theme, onChange }) => {
  const handleColorChange = (colorType, value) => {
    onChange({
      ...theme,
      [colorType]: value
    });
  };

  const handleFontChange = (value) => {
    onChange({
      ...theme,
      fontFamily: value
    });
  };

  const presetColors = [
    '#3b82f6', // Blue
    '#ef4444', // Red
    '#10b981', // Green
    '#f59e0b', // Yellow
    '#8b5cf6', // Purple
    '#06b6d4', // Cyan
    '#ec4899', // Pink
    '#6b7280'  // Gray
  ];

  const fonts = [
    { value: 'Inter, sans-serif', label: 'Inter (Modern)' },
    { value: 'Georgia, serif', label: 'Georgia (Classic)' },
    { value: 'Times New Roman, serif', label: 'Times New Roman' },
    { value: 'Arial, sans-serif', label: 'Arial' },
    { value: 'Helvetica, sans-serif', label: 'Helvetica' },
    { value: 'Roboto, sans-serif', label: 'Roboto' }
  ];

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Newsletter Theme</h3>
      
      {/* Primary Color */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Primary Color
        </label>
        <div className="flex items-center space-x-2">
          <input
            type="color"
            value={theme.primaryColor || '#3b82f6'}
            onChange={(e) => handleColorChange('primaryColor', e.target.value)}
            className="w-12 h-8 rounded border border-gray-300 cursor-pointer"
          />
          <input
            type="text"
            value={theme.primaryColor || '#3b82f6'}
            onChange={(e) => handleColorChange('primaryColor', e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
            placeholder="#3b82f6"
          />
        </div>
        
        {/* Preset Colors */}
        <div className="flex space-x-1 mt-2">
          {presetColors.map((color) => (
            <button
              key={color}
              onClick={() => handleColorChange('primaryColor', color)}
              className={`w-6 h-6 rounded border-2 ${
                theme.primaryColor === color ? 'border-gray-400' : 'border-gray-200'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      {/* Background Color */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Background Color
        </label>
        <div className="flex items-center space-x-2">
          <input
            type="color"
            value={theme.backgroundColor || '#ffffff'}
            onChange={(e) => handleColorChange('backgroundColor', e.target.value)}
            className="w-12 h-8 rounded border border-gray-300 cursor-pointer"
          />
          <input
            type="text"
            value={theme.backgroundColor || '#ffffff'}
            onChange={(e) => handleColorChange('backgroundColor', e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
            placeholder="#ffffff"
          />
        </div>
        
        {/* Background Presets */}
        <div className="flex space-x-1 mt-2">
          {['#ffffff', '#f9fafb', '#f3f4f6', '#e5e7eb', '#fef7ed', '#f0f9ff', '#f5f3ff', '#fdf2f8'].map((color) => (
            <button
              key={color}
              onClick={() => handleColorChange('backgroundColor', color)}
              className={`w-6 h-6 rounded border-2 ${
                theme.backgroundColor === color ? 'border-gray-400' : 'border-gray-200'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      {/* Font Family */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Font Family
        </label>
        <select
          value={theme.fontFamily || 'Inter, sans-serif'}
          onChange={(e) => handleFontChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {fonts.map((font) => (
            <option key={font.value} value={font.value}>
              {font.label}
            </option>
          ))}
        </select>
      </div>

      {/* Preview */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Theme Preview
        </label>
        <div 
          className="p-4 rounded border"
          style={{ 
            backgroundColor: theme.backgroundColor || '#ffffff',
            fontFamily: theme.fontFamily || 'Inter, sans-serif'
          }}
        >
          <h3 
            className="text-xl font-bold mb-2"
            style={{ color: theme.primaryColor || '#3b82f6' }}
          >
            Newsletter Title
          </h3>
          <p className="text-gray-700">
            This is how your newsletter will look with the selected theme. 
            Headers will use the primary color, while body text remains readable.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ThemeControls;
