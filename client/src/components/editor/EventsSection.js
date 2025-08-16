import React from 'react';

const EventsSection = ({ section, onChange, onDelete, isEditing, theme }) => {
  const { data } = section;

  const handleChange = (field, value) => {
    onChange(section.id, {
      ...data,
      [field]: value
    });
  };

  const handleEventChange = (eventIndex, field, value) => {
    const updatedEvents = [...data.events];
    updatedEvents[eventIndex] = {
      ...updatedEvents[eventIndex],
      [field]: value
    };
    handleChange('events', updatedEvents);
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

  const addEvent = () => {
    const newEvent = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      title: 'New Event',
      description: ''
    };
    handleChange('events', [...data.events, newEvent]);
  };

  const removeEvent = (eventIndex) => {
    const updatedEvents = data.events.filter((_, index) => index !== eventIndex);
    handleChange('events', updatedEvents);
  };

  if (!isEditing) {
    const titleColor = data.style?.titleColor || theme?.primaryColor || '#1f2937';
    const borderColor = theme?.primaryColor || '#3b82f6';
    
    return (
      <div className="py-4">
        <h3 
          className="text-lg font-semibold mb-4"
          style={{ color: titleColor }}
        >
          {data.title}
        </h3>
        <div className="space-y-3">
          {data.events.map((event, index) => (
            <div 
              key={event.id} 
              className="border-l-4 pl-4 py-2"
              style={{ borderLeftColor: borderColor }}
            >
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-medium text-gray-900">{event.title}</h4>
                <span className="text-sm text-gray-500">
                  {new Date(event.date).toLocaleDateString()}
                </span>
              </div>
              {event.description && (
                <p className="text-gray-600 text-sm">{event.description}</p>
              )}
            </div>
          ))}
          {data.events.length === 0 && (
            <p className="text-gray-500 italic">No events scheduled</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="border-2 border-purple-200 rounded-lg p-4 bg-purple-50">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm font-semibold text-purple-800">Events Section</h3>
        <button
          onClick={() => onDelete(section.id)}
          className="text-red-500 hover:text-red-700 text-sm"
        >
          Delete
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Section Title
          </label>
          <input
            type="text"
            value={data.title}
            onChange={(e) => handleChange('title', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500"
            placeholder="e.g., Upcoming Events"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title Color
          </label>
          <input
            type="color"
            value={data.style?.titleColor || theme?.primaryColor || '#1f2937'}
            onChange={(e) => handleStyleChange('titleColor', e.target.value)}
            className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-700">Events</label>
            <button
              onClick={addEvent}
              className="text-purple-600 hover:text-purple-800 text-sm font-medium"
            >
              + Add Event
            </button>
          </div>

          <div className="space-y-3">
            {data.events.map((event, index) => (
              <div key={event.id} className="border border-gray-200 rounded p-3 bg-white">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-medium text-gray-700">Event {index + 1}</span>
                  <button
                    onClick={() => removeEvent(index)}
                    className="text-red-500 hover:text-red-700 text-xs"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div>
                    <input
                      type="text"
                      value={event.title}
                      onChange={(e) => handleEventChange(index, 'title', e.target.value)}
                      placeholder="Event title"
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <input
                      type="date"
                      value={event.date}
                      onChange={(e) => handleEventChange(index, 'date', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <textarea
                  value={event.description}
                  onChange={(e) => handleEventChange(index, 'description', e.target.value)}
                  placeholder="Event description (optional)"
                  rows={2}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventsSection;
