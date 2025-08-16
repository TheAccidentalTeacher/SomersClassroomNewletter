// Section type definitions and default content

export const SECTION_TYPES = {
  HEADER: 'header',
  TITLE: 'title',
  RICH_TEXT: 'richText',
  EVENTS: 'events',
  CONTACT: 'contact',
  IMAGE: 'image'
};

export const createSection = (type, order = 0) => {
  const baseSection = {
    id: `section-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    order
  };

  switch (type) {
    case SECTION_TYPES.HEADER:
      return {
        ...baseSection,
        data: {
          title: 'STUDENT READING',
          subtitle: 'Module 12 | 7th Grade Geography',
          level: 'Standard Level',
          showNameLine: true,
          style: {
            titleFontSize: 'xl',
            textAlign: 'center',
            color: '#1f2937',
            showBorder: true
          }
        }
      };

    case SECTION_TYPES.TITLE:
      return {
        ...baseSection,
        data: {
          title: 'Newsletter Title',
          subtitle: '',
          style: {
            fontSize: '2xl',
            textAlign: 'center',
            color: '#1f2937'
          }
        }
      };

    case SECTION_TYPES.RICH_TEXT:
      return {
        ...baseSection,
        data: {
          content: 'Start typing your content here...',
          style: {
            fontSize: 'base',
            textAlign: 'left'
          }
        }
      };

    case SECTION_TYPES.EVENTS:
      return {
        ...baseSection,
        data: {
          title: 'Upcoming Events',
          events: [
            {
              id: 1,
              date: new Date().toISOString().split('T')[0],
              title: 'Sample Event',
              description: 'Event description goes here'
            }
          ]
        }
      };

    case SECTION_TYPES.CONTACT:
      return {
        ...baseSection,
        data: {
          title: 'Contact Information',
          teacherName: 'Teacher Name',
          email: 'teacher@school.edu',
          phone: '(555) 123-4567',
          room: 'Room 123',
          officeHours: 'Mon-Fri 3:00-4:00 PM'
        }
      };

    case SECTION_TYPES.IMAGE:
      return {
        ...baseSection,
        data: {
          url: '',
          alt: 'Image description',
          caption: '',
          style: {
            width: '100%',
            alignment: 'center'
          }
        }
      };

    default:
      return baseSection;
  }
};

export const SECTION_LABELS = {
  [SECTION_TYPES.HEADER]: 'Document Header',
  [SECTION_TYPES.TITLE]: 'Title Section',
  [SECTION_TYPES.RICH_TEXT]: 'Text Content',
  [SECTION_TYPES.EVENTS]: 'Events List',
  [SECTION_TYPES.CONTACT]: 'Contact Info',
  [SECTION_TYPES.IMAGE]: 'Image'
};
