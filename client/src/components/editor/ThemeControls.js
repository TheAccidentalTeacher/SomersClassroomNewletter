import React from 'react';

const ThemeControls = ({ theme, onChange, selectedTheme, onThemeChange }) => {
  
  // Professional theme presets matching Canva style
  const themePresets = [
    {
      name: 'professional',
      label: 'Professional Blue',
      primaryColor: '#2563eb',
      secondaryColor: '#64748b',
      accentColor: '#f59e0b',
      backgroundColor: '#ffffff',
      fontFamily: 'Georgia, serif',
      icon: '💼'
    },
    {
      name: 'colorful',
      label: 'Vibrant & Fun',
      primaryColor: '#7c3aed',
      secondaryColor: '#06b6d4',
      accentColor: '#f59e0b',
      backgroundColor: '#fef7ff',
      fontFamily: 'Comic Sans MS, cursive',
      icon: '🎨'
    },
    {
      name: 'minimal',
      label: 'Clean Minimal',
      primaryColor: '#374151',
      secondaryColor: '#9ca3af',
      accentColor: '#ef4444',
      backgroundColor: '#ffffff',
      fontFamily: 'Helvetica, sans-serif',
      icon: '✨'
    },
    {
      name: 'playful',
      label: 'Playful Kids',
      primaryColor: '#ec4899',
      secondaryColor: '#8b5cf6',
      accentColor: '#10b981',
      backgroundColor: '#fff7ed',
      fontFamily: 'Comic Sans MS, cursive',
      icon: '🌈'
    },
    {
      name: 'autumn',
      label: 'Autumn Warmth',
      primaryColor: '#ea580c',
      secondaryColor: '#92400e',
      accentColor: '#f59e0b',
      backgroundColor: '#fef7ed',
      fontFamily: 'Georgia, serif',
      icon: '🍂'
    },
    {
      name: 'academic',
      label: 'Academic Classic',
      primaryColor: '#1e40af',
      secondaryColor: '#475569',
      accentColor: '#dc2626',
      backgroundColor: '#ffffff',
      fontFamily: 'Times New Roman, serif',
      icon: '🎓'
    }
  ];

  const handleThemeSelect = (preset) => {
    const newTheme = {
      primaryColor: preset.primaryColor,
      secondaryColor: preset.secondaryColor,
      accentColor: preset.accentColor,
      backgroundColor: preset.backgroundColor,
      fontFamily: preset.fontFamily
    };
    
    onChange(newTheme);
    onThemeChange?.(preset.name);
  };

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
    '#2563eb', '#3b82f6', '#1d4ed8', // Blues
    '#dc2626', '#ef4444', '#f87171', // Reds
    '#059669', '#10b981', '#34d399', // Greens
    '#d97706', '#f59e0b', '#fbbf24', // Yellows/Oranges
    '#7c3aed', '#8b5cf6', '#a78bfa', // Purples
    '#0891b2', '#06b6d4', '#22d3ee', // Cyans
    '#db2777', '#ec4899', '#f472b6', // Pinks
    '#374151', '#6b7280', '#9ca3af'  // Grays
  ];

  const fonts = [
    { value: 'Georgia, serif', label: 'Georgia (Classic Serif)' },
    { value: 'Times New Roman, serif', label: 'Times New Roman' },
    { value: 'Inter, sans-serif', label: 'Inter (Modern Sans)' },
    { value: 'Arial, sans-serif', label: 'Arial' },
    { value: 'Helvetica, sans-serif', label: 'Helvetica' },
    { value: 'Roboto, sans-serif', label: 'Roboto' },
    { value: 'Comic Sans MS, cursive', label: 'Comic Sans (Fun)' },
    { value: 'Impact, sans-serif', label: 'Impact (Bold)' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <span className="mr-2">🎨</span>
          Newsletter Theme
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Choose a theme that matches your classroom style
        </p>
      </div>

      {/* Theme Presets */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3">Theme Presets</h4>
        <div className="grid grid-cols-1 gap-3">
          {themePresets.map((preset) => (
            <button
              key={preset.name}
              onClick={() => handleThemeSelect(preset)}
              className={`
                p-3 rounded-lg border-2 text-left transition-all hover:shadow-md
                ${selectedTheme === preset.name 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 bg-white hover:border-gray-300'
                }
              `}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <span className="text-lg mr-2">{preset.icon}</span>
                  <span className="font-medium text-gray-900">{preset.label}</span>
                </div>
                {selectedTheme === preset.name && (
                  <span className="text-blue-600 text-sm">✓ Active</span>
                )}
              </div>
              
              <div className="flex space-x-1 mb-2">
                <div 
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: preset.primaryColor }}
                  title="Primary Color"
                />
                <div 
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: preset.secondaryColor }}
                  title="Secondary Color"
                />
                <div 
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: preset.accentColor }}
                  title="Accent Color"
                />
                <div 
                  className="w-4 h-4 rounded border"
                  style={{ backgroundColor: preset.backgroundColor }}
                  title="Background Color"
                />
              </div>
              
              <div className="text-xs text-gray-500" style={{ fontFamily: preset.fontFamily }}>
                {preset.fontFamily.split(',')[0]} • Sample text
              </div>
            </button>
          ))}
        </div>
      </div>

      <hr className="border-gray-200" />

      {/* Custom Colors */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3">Custom Colors</h4>
        
        {/* Primary Color */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Primary Color (Headers & Accents)
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={theme.primaryColor || '#3b82f6'}
              onChange={(e) => handleColorChange('primaryColor', e.target.value)}
              className="w-10 h-8 rounded border border-gray-300 cursor-pointer"
            />
            <input
              type="text"
              value={theme.primaryColor || '#3b82f6'}
              onChange={(e) => handleColorChange('primaryColor', e.target.value)}
              className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs"
              placeholder="#3b82f6"
            />
          </div>
          
          {/* Primary Color Presets */}
          <div className="grid grid-cols-8 gap-1 mt-2">
            {presetColors.slice(0, 8).map((color) => (
              <button
                key={color}
                onClick={() => handleColorChange('primaryColor', color)}
                className={`w-6 h-6 rounded border-2 ${
                  theme.primaryColor === color ? 'border-gray-600' : 'border-gray-200'
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>

        {/* Background Color */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Background Color
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={theme.backgroundColor || '#ffffff'}
              onChange={(e) => handleColorChange('backgroundColor', e.target.value)}
              className="w-10 h-8 rounded border border-gray-300 cursor-pointer"
            />
            <input
              type="text"
              value={theme.backgroundColor || '#ffffff'}
              onChange={(e) => handleColorChange('backgroundColor', e.target.value)}
              className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs"
              placeholder="#ffffff"
            />
          </div>
          
          {/* Background Presets */}
          <div className="grid grid-cols-8 gap-1 mt-2">
            {['#ffffff', '#f9fafb', '#f3f4f6', '#e5e7eb', '#fef7ed', '#f0f9ff', '#f5f3ff', '#fdf2f8'].map((color) => (
              <button
                key={color}
                onClick={() => handleColorChange('backgroundColor', color)}
                className={`w-6 h-6 rounded border-2 ${
                  theme.backgroundColor === color ? 'border-gray-600' : 'border-gray-200'
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Font Family */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-2">
          Font Family
        </label>
        <select
          value={theme.fontFamily || 'Inter, sans-serif'}
          onChange={(e) => handleFontChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {fonts.map((font) => (
            <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
              {font.label}
            </option>
          ))}
        </select>
      </div>

      {/* Live Preview */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3">Live Preview</h4>
        <div 
          className="p-4 rounded-lg border-2 border-dashed border-gray-300"
          style={{ 
            backgroundColor: theme.backgroundColor || '#ffffff',
            fontFamily: theme.fontFamily || 'Inter, sans-serif'
          }}
        >
          <h3 
            className="text-lg font-bold mb-2"
            style={{ color: theme.primaryColor || '#3b82f6' }}
          >
            📚 Weekly Newsletter
          </h3>
          <div className="text-sm text-gray-700 mb-3">
            <strong>Welcome to our classroom!</strong> This week we've been learning about science, math, and reading. 
          </div>
          <div 
            className="inline-block px-3 py-1 rounded text-white text-xs font-medium"
            style={{ backgroundColor: theme.primaryColor || '#3b82f6' }}
          >
            Important Date: Friday, Oct 25
          </div>
        </div>
      </div>

      {/* Reset Button */}
      <div className="pt-4 border-t border-gray-200">
        <button
          onClick={() => handleThemeSelect(themePresets[0])}
          className="w-full px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          Reset to Default Theme
        </button>
      </div>
    </div>
  );
};

export default ThemeControls;
