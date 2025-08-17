import React, { useState } from 'react';
import HeaderSection from './HeaderSection';
import TitleSection from './TitleSection';
import RichTextSection from './RichTextSection';
import EventsSection from './EventsSection';
import ContactSection from './ContactSection';
import ImageSection from './ImageSection';
import { SECTION_TYPES } from './SectionTypes';

const SectionRenderer = ({ section, onChange, onDelete, isEditing, theme }) => {
  const [sectionEditing, setSectionEditing] = useState(isEditing);
  
  const props = { 
    section, 
    onUpdate: onChange, 
    onDelete, 
    isEditing: sectionEditing,
    onEdit: setSectionEditing,
    theme 
  };

  switch (section.type) {
    case SECTION_TYPES.HEADER:
      return <HeaderSection {...{ section, onChange, onDelete, isEditing: sectionEditing, theme }} />;
    case SECTION_TYPES.TITLE:
      return <TitleSection {...{ section, onChange, onDelete, isEditing: sectionEditing, theme }} />;
    case SECTION_TYPES.RICH_TEXT:
      return <RichTextSection {...{ section, onChange, onDelete, isEditing: sectionEditing, theme }} />;
    case SECTION_TYPES.EVENTS:
      return <EventsSection {...{ section, onChange, onDelete, isEditing: sectionEditing, theme }} />;
    case SECTION_TYPES.CONTACT:
      return <ContactSection {...{ section, onChange, onDelete, isEditing: sectionEditing, theme }} />;
    case SECTION_TYPES.IMAGE:
      return <ImageSection {...props} />;
    default:
      return (
        <div className="p-4 border border-red-200 rounded bg-red-50">
          <p className="text-red-600">Unknown section type: {section.type}</p>
        </div>
      );
  }
};

export default SectionRenderer;
