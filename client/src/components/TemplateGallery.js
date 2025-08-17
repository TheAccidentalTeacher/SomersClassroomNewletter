import React, { useState, useEffect } from 'react';
// import { useTemplate } from '../contexts/TemplateContext';

const TemplateGallery = ({ onSelectTemplate, currentNewsletter }) => {
  // const { templates, loadTemplates, createFromTemplate } = useTemplate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [previewTemplate, setPreviewTemplate] = useState(null);

  // Mock templates for now
  const templates = [
    {
      id: 'prof-1',
      title: 'Professional Newsletter',
      category: 'professional',
      theme: 'professional',
      content: {
        text: 'Welcome to our professional newsletter...'
      },
      thumbnail: 'https://via.placeholder.com/300x200/4F46E5/ffffff?text=Professional'
    },
    {
      id: 'colorful-1', 
      title: 'Colorful Design',
      category: 'colorful',
      theme: 'colorful',
      content: {
        text: 'Bright and engaging newsletter content...'
      },
      thumbnail: 'https://via.placeholder.com/300x200/EC4899/ffffff?text=Colorful'
    }
  ];

  useEffect(() => {
    // loadTemplates();
  }, []);

  // Built-in professional templates matching Canva quality
  const builtInTemplates = [
    {
      id: 'modern-classroom',
      name: 'Modern Classroom',
      category: 'education',
      preview: '/api/placeholder/300/400',
      description: 'Clean, modern design perfect for any classroom',
      sections: [
        {
          type: 'header',
          data: {
            title: 'Weekly Newsletter',
            subtitle: 'Mrs. Johnson\'s 3rd Grade Class',
            backgroundColor: '#2563eb',
            textColor: '#ffffff'
          }
        },
        {
          type: 'title',
          title: 'This Week in Our Classroom',
          subtitle: 'Exciting learning adventures await!'
        },
        {
          type: 'richText',
          content: '**Welcome back, families!** This week has been filled with amazing discoveries and learning moments. Our students have been working hard on their reading comprehension skills and exploring the fascinating world of science.\n\n*We hope you enjoy this weekly update on our classroom activities.*'
        },
        {
          type: 'events',
          data: {
            title: 'Upcoming Events & Important Dates',
            events: [
              {
                title: 'Parent-Teacher Conferences',
                date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                description: 'Schedule your 15-minute conference slot online'
              },
              {
                title: 'Science Fair Projects Due',
                date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
                description: 'Students should have their projects ready to present'
              },
              {
                title: 'Field Trip to Natural History Museum',
                date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
                description: 'Permission slips and $15 fee due by Friday'
              }
            ]
          }
        },
        {
          type: 'contact',
          data: {
            teacherName: 'Mrs. Johnson',
            email: 'mjohnson@school.edu',
            room: 'Room 305',
            officeHours: 'Monday-Friday 3:00-4:00 PM'
          }
        }
      ],
      theme: 'professional'
    },
    {
      id: 'creative-kids',
      name: 'Creative Kids',
      category: 'elementary',
      preview: '/api/placeholder/300/400',
      description: 'Colorful and playful design for elementary classes',
      sections: [
        {
          type: 'header',
          data: {
            title: '🌟 Our Amazing Week! 🌟',
            subtitle: 'Adventures in Room 12',
            backgroundColor: '#ec4899',
            textColor: '#ffffff'
          }
        },
        {
          type: 'title',
          title: 'Learning is Fun!',
          subtitle: 'See what we\'ve been up to this week'
        },
        {
          type: 'richText',
          content: '**Hello, wonderful families!** 👋\n\nWhat an incredible week we\'ve had in our classroom! Your children have been *absolutely amazing* and have shown so much growth in their learning journey.\n\n🎨 **Art Corner:** We created beautiful autumn leaf collages\n📚 **Reading Adventures:** Explored fairy tales from around the world\n🔬 **Science Fun:** Learned about magnets and conducted cool experiments!'
        },
        {
          type: 'events',
          data: {
            title: '📅 Don\'t Forget These Important Dates!',
            events: [
              {
                title: '🎭 School Play Auditions',
                date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
                description: 'After school in the gymnasium - no experience needed!'
              },
              {
                title: '🍕 Pizza Party Fundraiser',
                date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
                description: 'Order forms due this Friday'
              },
              {
                title: '🌟 Student of the Month Assembly',
                date: new Date(Date.now() + 17 * 24 * 60 * 60 * 1000).toISOString(),
                description: 'Come celebrate our amazing students!'
              }
            ]
          }
        }
      ],
      theme: 'playful'
    },
    {
      id: 'academic-excellence',
      name: 'Academic Excellence',
      category: 'secondary',
      preview: '/api/placeholder/300/400',
      description: 'Professional template for middle and high school',
      sections: [
        {
          type: 'header',
          data: {
            title: 'Academic Update',
            subtitle: 'AP Biology - Mr. Thompson',
            backgroundColor: '#374151',
            textColor: '#ffffff'
          }
        },
        {
          type: 'title',
          title: 'Course Progress Report',
          subtitle: 'Week of [Date]'
        },
        {
          type: 'richText',
          content: '**Dear Students and Parents,**\n\nThis week we made significant progress in our study of cellular biology. Students demonstrated excellent understanding of mitosis and meiosis through our laboratory exercises.\n\n**Key Learning Objectives Covered:**\n• Cell division processes\n• Genetic variation mechanisms\n• Laboratory safety protocols\n• Data analysis and interpretation'
        },
        {
          type: 'events',
          data: {
            title: 'Important Academic Dates',
            events: [
              {
                title: 'Unit 3 Exam - Cell Biology',
                date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                description: 'Covers chapters 9-11, including laboratory work'
              },
              {
                title: 'AP Practice Test',
                date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
                description: 'Optional but highly recommended for AP students'
              }
            ]
          }
        },
        {
          type: 'contact',
          data: {
            teacherName: 'Mr. Thompson',
            email: 'rthompson@school.edu',
            room: 'Science Lab 201',
            officeHours: 'Tuesday & Thursday 3:30-4:30 PM'
          }
        }
      ],
      theme: 'minimal'
    },
    {
      id: 'seasonal-autumn',
      name: 'Autumn Harvest',
      category: 'seasonal',
      preview: '/api/placeholder/300/400',
      description: 'Warm autumn theme perfect for fall newsletters',
      sections: [
        {
          type: 'header',
          data: {
            title: '🍂 Autumn Learning Adventures 🍂',
            subtitle: 'Harvesting Knowledge Together',
            backgroundColor: '#f59e0b',
            textColor: '#ffffff'
          }
        },
        {
          type: 'title',
          title: 'Fall Into Learning!',
          subtitle: 'Celebrating the season of knowledge'
        },
        {
          type: 'richText',
          content: '**Dear Families,** 🧡\n\nAs the leaves change colors and the air grows crisp, our classroom is buzzing with autumn-themed learning activities! This week has been particularly special as we\'ve connected our curriculum to the beautiful season around us.\n\n🍎 **Math:** Counting and sorting colorful leaves\n📖 **Reading:** Autumn poetry and seasonal stories\n🎨 **Art:** Creating leaf prints and harvest decorations\n🔬 **Science:** Why do leaves change color?'
        },
        {
          type: 'events',
          data: {
            title: '🍂 Autumn Activities & Events',
            events: [
              {
                title: '🎃 Pumpkin Math Day',
                date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
                description: 'Bring a small pumpkin for measuring and weighing activities'
              },
              {
                title: '🍁 Fall Festival',
                date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
                description: 'Join us for games, treats, and family fun!'
              },
              {
                title: '🦃 Thanksgiving Break',
                date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
                description: 'No school - enjoy time with your families'
              }
            ]
          }
        }
      ],
      theme: 'colorful'
    },
    {
      id: 'stem-focused',
      name: 'STEM Explorer',
      category: 'subject',
      preview: '/api/placeholder/300/400',
      description: 'Perfect for science, technology, and math classes',
      sections: [
        {
          type: 'header',
          data: {
            title: '🔬 STEM Discoveries 🔬',
            subtitle: 'Exploring Science, Technology, Engineering & Math',
            backgroundColor: '#7c3aed',
            textColor: '#ffffff'
          }
        },
        {
          type: 'title',
          title: 'Innovation in Action',
          subtitle: 'This week in STEM education'
        },
        {
          type: 'richText',
          content: '**Future Scientists and Engineers,** 🚀\n\nThis week has been filled with exciting discoveries and hands-on experiments! Our students have been exploring the fundamental concepts of engineering design while developing critical thinking skills.\n\n**🧪 Lab Highlights:**\n• Built and tested bridge designs\n• Programmed simple robots\n• Analyzed data from weather experiments\n• Collaborated on problem-solving challenges\n\n*"The best way to learn science is to do science!"*'
        },
        {
          type: 'events',
          data: {
            title: '🎯 STEM Events & Competitions',
            events: [
              {
                title: '🤖 Robotics Competition',
                date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
                description: 'Regional competition at the community center'
              },
              {
                title: '🧬 Science Fair',
                date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
                description: 'Projects due for judging - prizes for all participants!'
              }
            ]
          }
        }
      ],
      theme: 'professional'
    }
  ];

  const categories = [
    { value: 'all', label: 'All Templates', icon: '📋' },
    { value: 'education', label: 'General Education', icon: '🎓' },
    { value: 'elementary', label: 'Elementary', icon: '🏫' },
    { value: 'secondary', label: 'Middle/High School', icon: '📚' },
    { value: 'subject', label: 'Subject-Specific', icon: '🔬' },
    { value: 'seasonal', label: 'Seasonal', icon: '🌸' },
    { value: 'custom', label: 'My Templates', icon: '⭐' }
  ];

  const filteredTemplates = () => {
    let filtered = [...builtInTemplates, ...(templates || [])];
    
    if (selectedCategory !== 'all') {
      if (selectedCategory === 'custom') {
        filtered = templates || [];
      } else {
        filtered = filtered.filter(template => template.category === selectedCategory);
      }
    }
    
    if (searchTerm) {
      filtered = filtered.filter(template => 
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };

  const handleSelectTemplate = async (template) => {
    try {
      const newNewsletter = {
        title: template.name,
        sections: template.sections,
        theme: template.theme || 'professional',
        templateId: template.id
      };
      
      onSelectTemplate(newNewsletter);
    } catch (error) {
      console.error('Error selecting template:', error);
      alert('Failed to load template. Please try again.');
    }
  };

  const renderTemplateCard = (template) => (
    <div
      key={template.id}
      className="group bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer"
      onClick={() => handleSelectTemplate(template)}
    >
      {/* Template Preview */}
      <div className="relative aspect-[3/4] bg-gray-100">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center">
          <div className="text-6xl opacity-50">
            {template.category === 'elementary' && '🎨'}
            {template.category === 'secondary' && '📊'}
            {template.category === 'subject' && '🔬'}
            {template.category === 'seasonal' && '🍂'}
            {template.category === 'education' && '📚'}
            {!['elementary', 'secondary', 'subject', 'seasonal', 'education'].includes(template.category) && '📋'}
          </div>
        </div>
        
        {/* Quick Preview Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setPreviewTemplate(template);
          }}
          className="absolute top-2 right-2 bg-white/90 hover:bg-white text-gray-600 p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <span className="text-sm">👁️</span>
        </button>

        {/* Template Category Badge */}
        <div className="absolute top-2 left-2">
          <span className="bg-white/90 text-xs font-medium px-2 py-1 rounded-full text-gray-700">
            {categories.find(cat => cat.value === template.category)?.label || 'Template'}
          </span>
        </div>
      </div>

      {/* Template Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
          {template.name}
        </h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {template.description}
        </p>
        
        {/* Template Stats */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{template.sections?.length || 0} sections</span>
          <span className="capitalize">{template.theme || 'professional'} theme</span>
        </div>
      </div>

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-blue-600/90 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <button className="bg-white text-blue-600 px-6 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors">
          Use This Template
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          📚 Choose a Template
        </h2>
        <p className="text-gray-600">
          Start with a professional template and customize it for your classroom
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.value}
              onClick={() => setSelectedCategory(category.value)}
              className={`
                px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1
                ${selectedCategory === category.value
                  ? 'bg-blue-100 text-blue-700 border border-blue-300'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                }
              `}
            >
              <span>{category.icon}</span>
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredTemplates().map(template => renderTemplateCard(template))}
      </div>

      {/* Empty State */}
      {filteredTemplates().length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📭</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No templates found
          </h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your search or filters to find more templates
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
            }}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Template Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">{previewTemplate.name}</h3>
                <button
                  onClick={() => setPreviewTemplate(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg mb-4">
                <p className="text-gray-600 mb-4">{previewTemplate.description}</p>
                <div className="text-sm text-gray-500">
                  <strong>Sections:</strong> {previewTemplate.sections?.length || 0} | 
                  <strong> Theme:</strong> {previewTemplate.theme || 'professional'} |
                  <strong> Category:</strong> {categories.find(cat => cat.value === previewTemplate.category)?.label}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    handleSelectTemplate(previewTemplate);
                    setPreviewTemplate(null);
                  }}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Use This Template
                </button>
                <button
                  onClick={() => setPreviewTemplate(null)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateGallery;
