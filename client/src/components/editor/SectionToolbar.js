import React from 'react';
import { SECTION_TYPES, SECTION_LABELS, createSection } from './SectionTypes';

const SectionToolbar = ({ onAddSection }) => {
  const handleAddSection = (type) => {
    const newSection = createSection(type);
    onAddSection(newSection);
  };

  return (
    <div className="bg-white border-b border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-gray-800 mb-3">Add Section</h3>
      <div className="grid grid-cols-2 gap-2">
        {Object.entries(SECTION_TYPES).map(([key, type]) => (
          <button
            key={type}
            onClick={() => handleAddSection(type)}
            className="flex items-center justify-center p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors duration-200 text-sm font-medium text-gray-600 hover:text-blue-600"
          >
            <span className="mr-2">
              {type === SECTION_TYPES.HEADER && '📋'}
              {type === SECTION_TYPES.TITLE && '📝'}
              {type === SECTION_TYPES.RICH_TEXT && '📄'}
              {type === SECTION_TYPES.EVENTS && '📅'}
              {type === SECTION_TYPES.CONTACT && '📞'}
              {type === SECTION_TYPES.IMAGE && '🖼️'}
            </span>
            {SECTION_LABELS[type]}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SectionToolbar;
