import React from 'react';

const LayoutControls = ({ newsletter, onChange }) => {
  const handleLayoutChange = (setting, value) => {
    const updatedSettings = {
      ...newsletter.settings,
      layout: {
        ...newsletter.settings?.layout,
        [setting]: value
      }
    };
    
    onChange({
      ...newsletter,
      settings: updatedSettings
    });
  };

  const layoutSettings = newsletter.settings?.layout || {
    sectionSpacing: 'normal',
    contentWidth: 'normal',
    pageMargins: 'normal'
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Newsletter Layout</h3>
      
      {/* Section Spacing */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Section Spacing
        </label>
        <select
          value={layoutSettings.sectionSpacing}
          onChange={(e) => handleLayoutChange('sectionSpacing', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="tight">Tight (Less space between sections)</option>
          <option value="normal">Normal (Default spacing)</option>
          <option value="loose">Loose (More space between sections)</option>
          <option value="extra-loose">Extra Loose (Maximum spacing)</option>
        </select>
      </div>

      {/* Content Width */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Content Width
        </label>
        <select
          value={layoutSettings.contentWidth}
          onChange={(e) => handleLayoutChange('contentWidth', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="narrow">Narrow (Easy to read, good for text-heavy newsletters)</option>
          <option value="normal">Normal (Balanced width)</option>
          <option value="wide">Wide (More content per line)</option>
          <option value="full">Full Width (Uses entire screen)</option>
        </select>
      </div>

      {/* Page Margins */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Page Margins
        </label>
        <select
          value={layoutSettings.pageMargins}
          onChange={(e) => handleLayoutChange('pageMargins', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="minimal">Minimal (More content, less white space)</option>
          <option value="normal">Normal (Balanced margins)</option>
          <option value="generous">Generous (Plenty of white space)</option>
        </select>
      </div>

      {/* Preview */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Layout Preview
        </label>
        <div className="border rounded p-3 bg-gray-50">
          <div 
            className={`bg-white border rounded p-2 ${
              layoutSettings.pageMargins === 'minimal' ? 'mx-0' :
              layoutSettings.pageMargins === 'generous' ? 'mx-4' : 'mx-2'
            }`}
          >
            <div 
              className={`${
                layoutSettings.contentWidth === 'narrow' ? 'max-w-md mx-auto' :
                layoutSettings.contentWidth === 'wide' ? 'max-w-5xl mx-auto' :
                layoutSettings.contentWidth === 'full' ? 'w-full' : 'max-w-4xl mx-auto'
              }`}
            >
              <div 
                className={`space-y-${
                  layoutSettings.sectionSpacing === 'tight' ? '2' :
                  layoutSettings.sectionSpacing === 'loose' ? '8' :
                  layoutSettings.sectionSpacing === 'extra-loose' ? '12' : '6'
                }`}
              >
                <div className="h-4 bg-blue-200 rounded"></div>
                <div className="h-6 bg-gray-200 rounded"></div>
                <div className="h-4 bg-green-200 rounded"></div>
                <div className="h-8 bg-purple-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Preview showing spacing, width, and margins settings
        </p>
      </div>
    </div>
  );
};

export default LayoutControls;
