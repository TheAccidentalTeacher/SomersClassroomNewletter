import React from 'react';

const ContactSection = ({ section, onChange, onDelete, isEditing }) => {
  const { data } = section;

  const handleChange = (field, value) => {
    onChange(section.id, {
      ...data,
      [field]: value
    });
  };

  if (!isEditing) {
    return (
      <div className="py-4 bg-gray-50 rounded-lg px-4">
        <h3 className="text-lg font-semibold mb-3 text-gray-800">
          {data.title}
        </h3>
        <div className="space-y-2 text-sm">
          {data.teacherName && (
            <p><strong>Teacher:</strong> {data.teacherName}</p>
          )}
          {data.email && (
            <p><strong>Email:</strong> {data.email}</p>
          )}
          {data.phone && (
            <p><strong>Phone:</strong> {data.phone}</p>
          )}
          {data.room && (
            <p><strong>Room:</strong> {data.room}</p>
          )}
          {data.officeHours && (
            <p><strong>Office Hours:</strong> {data.officeHours}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="border-2 border-yellow-200 rounded-lg p-4 bg-yellow-50">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm font-semibold text-yellow-800">Contact Section</h3>
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
            Section Title
          </label>
          <input
            type="text"
            value={data.title}
            onChange={(e) => handleChange('title', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-yellow-500"
            placeholder="e.g., Contact Information"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teacher Name
            </label>
            <input
              type="text"
              value={data.teacherName}
              onChange={(e) => handleChange('teacherName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-yellow-500"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={data.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-yellow-500"
              placeholder="your.email@school.edu"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              value={data.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-yellow-500"
              placeholder="(555) 123-4567"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Room
            </label>
            <input
              type="text"
              value={data.room}
              onChange={(e) => handleChange('room', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-yellow-500"
              placeholder="Room 123"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Office Hours
          </label>
          <input
            type="text"
            value={data.officeHours}
            onChange={(e) => handleChange('officeHours', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-yellow-500"
            placeholder="Mon-Fri 3:00-4:00 PM"
          />
        </div>
      </div>
    </div>
  );
};

export default ContactSection;
