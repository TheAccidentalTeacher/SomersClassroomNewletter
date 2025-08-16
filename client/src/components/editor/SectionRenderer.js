import React from 'react';
import TitleSection from './TitleSection';
import RichTextSection from './RichTextSection';
import EventsSection from './EventsSection';
import ContactSection from './ContactSection';
import { SECTION_TYPES } from './SectionTypes';

const SectionRenderer = ({ section, onChange, onDelete, isEditing }) => {
  const props = { section, onChange, onDelete, isEditing };

  switch (section.type) {
    case SECTION_TYPES.TITLE:
      return <TitleSection {...props} />;
    case SECTION_TYPES.RICH_TEXT:
      return <RichTextSection {...props} />;
    case SECTION_TYPES.EVENTS:
      return <EventsSection {...props} />;
    case SECTION_TYPES.CONTACT:
      return <ContactSection {...props} />;
    default:
      return (
        <div className="p-4 border border-red-200 rounded bg-red-50">
          <p className="text-red-600">Unknown section type: {section.type}</p>
        </div>
      );
  }
};

export default SectionRenderer;
