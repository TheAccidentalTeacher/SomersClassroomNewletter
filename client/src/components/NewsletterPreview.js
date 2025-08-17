import React, { forwardRef } from 'react';

const NewsletterPreview = forwardRef(({ newsletter, theme = 'professional' }, ref) => {
  const { sections = [], title = 'Untitled Newsletter' } = newsletter;

  // Theme configurations - matching Canva styles
  const themes = {
    professional: {
      primary: '#2563eb',
      secondary: '#64748b',
      accent: '#f59e0b',
      background: '#ffffff',
      text: '#1e293b',
      border: '#e2e8f0',
      fonts: {
        heading: 'Georgia, serif',
        body: 'Arial, sans-serif',
        accent: 'Impact, sans-serif'
      }
    },
    colorful: {
      primary: '#7c3aed',
      secondary: '#06b6d4',
      accent: '#f59e0b',
      background: '#fef7ff',
      text: '#581c87',
      border: '#d8b4fe',
      fonts: {
        heading: 'Comic Sans MS, cursive',
        body: 'Arial, sans-serif',
        accent: 'Arial Black, sans-serif'
      }
    },
    minimal: {
      primary: '#374151',
      secondary: '#9ca3af',
      accent: '#ef4444',
      background: '#ffffff',
      text: '#111827',
      border: '#e5e7eb',
      fonts: {
        heading: 'Helvetica, sans-serif',
        body: 'Helvetica, sans-serif',
        accent: 'Helvetica, sans-serif'
      }
    },
    playful: {
      primary: '#ec4899',
      secondary: '#8b5cf6',
      accent: '#10b981',
      background: '#fff7ed',
      text: '#7c2d12',
      border: '#fed7aa',
      fonts: {
        heading: 'Comic Sans MS, cursive',
        body: 'Trebuchet MS, sans-serif',
        accent: 'Impact, sans-serif'
      }
    }
  };

  const currentTheme = themes[theme] || themes.professional;

  const renderSection = (section, index) => {
    switch (section.type) {
      case 'title':
        return (
          <div key={index} className="text-center mb-8">
            <h1 
              style={{ 
                fontFamily: currentTheme.fonts.heading,
                color: currentTheme.primary,
                fontSize: '2.5rem',
                fontWeight: 'bold',
                marginBottom: '0.5rem',
                textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              {section.title || 'Newsletter Title'}
            </h1>
            {section.subtitle && (
              <p 
                style={{ 
                  fontFamily: currentTheme.fonts.body,
                  color: currentTheme.secondary,
                  fontSize: '1.2rem',
                  fontStyle: 'italic'
                }}
              >
                {section.subtitle}
              </p>
            )}
            <div 
              style={{ 
                height: '4px',
                background: `linear-gradient(90deg, ${currentTheme.primary}, ${currentTheme.accent})`,
                margin: '1rem auto',
                width: '200px',
                borderRadius: '2px'
              }}
            ></div>
          </div>
        );

      case 'header':
        return (
          <div 
            key={index}
            style={{ 
              background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.secondary})`,
              color: 'white',
              padding: '2rem',
              borderRadius: '12px',
              marginBottom: '2rem',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }}
          >
            <h2 
              style={{ 
                fontFamily: currentTheme.fonts.accent,
                fontSize: '2rem',
                margin: '0 0 0.5rem 0',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}
            >
              {section.data?.title || 'CLASSROOM NEWSLETTER'}
            </h2>
            <p style={{ fontSize: '1.1rem', margin: 0, opacity: 0.9 }}>
              {section.data?.subtitle || 'Week of August 17, 2025'}
            </p>
          </div>
        );

      case 'richText':
        return (
          <div 
            key={index}
            style={{ 
              background: currentTheme.background,
              border: `2px solid ${currentTheme.border}`,
              borderRadius: '8px',
              padding: '1.5rem',
              marginBottom: '1.5rem',
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
            }}
          >
            <div 
              style={{ 
                fontFamily: currentTheme.fonts.body,
                fontSize: '1rem',
                lineHeight: '1.6',
                color: currentTheme.text
              }}
              dangerouslySetInnerHTML={{ 
                __html: formatContent(section.data?.content || section.content || 'Content goes here...')
              }}
            />
          </div>
        );

      case 'events':
        return (
          <div 
            key={index}
            style={{ 
              background: `linear-gradient(135deg, ${currentTheme.accent}15, ${currentTheme.primary}15)`,
              border: `2px solid ${currentTheme.accent}`,
              borderRadius: '12px',
              padding: '1.5rem',
              marginBottom: '1.5rem'
            }}
          >
            <h3 
              style={{ 
                fontFamily: currentTheme.fonts.heading,
                color: currentTheme.primary,
                fontSize: '1.5rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <span style={{ fontSize: '1.8rem', marginRight: '0.5rem' }}>📅</span>
              {section.data?.title || 'Upcoming Events'}
            </h3>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {(section.data?.events || []).map((event, eventIndex) => (
                <div 
                  key={eventIndex}
                  style={{ 
                    background: currentTheme.background,
                    padding: '1rem',
                    borderRadius: '8px',
                    borderLeft: `4px solid ${currentTheme.accent}`,
                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4 
                        style={{ 
                          fontFamily: currentTheme.fonts.body,
                          fontSize: '1.1rem',
                          fontWeight: 'bold',
                          color: currentTheme.primary,
                          margin: '0 0 0.5rem 0'
                        }}
                      >
                        {event.title}
                      </h4>
                      <p 
                        style={{ 
                          fontFamily: currentTheme.fonts.body,
                          color: currentTheme.text,
                          margin: 0,
                          fontSize: '0.95rem'
                        }}
                      >
                        {event.description}
                      </p>
                    </div>
                    <div 
                      style={{ 
                        background: currentTheme.accent,
                        color: 'white',
                        padding: '0.5rem',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        fontWeight: 'bold',
                        minWidth: '80px',
                        textAlign: 'center'
                      }}
                    >
                      {new Date(event.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'contact':
        return (
          <div 
            key={index}
            style={{ 
              background: `linear-gradient(135deg, ${currentTheme.secondary}20, ${currentTheme.primary}20)`,
              border: `2px solid ${currentTheme.secondary}`,
              borderRadius: '12px',
              padding: '1.5rem',
              marginBottom: '1.5rem'
            }}
          >
            <h3 
              style={{ 
                fontFamily: currentTheme.fonts.heading,
                color: currentTheme.primary,
                fontSize: '1.5rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <span style={{ fontSize: '1.8rem', marginRight: '0.5rem' }}>📞</span>
              Contact Information
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <strong style={{ color: currentTheme.primary }}>Teacher:</strong><br />
                {section.data?.teacherName || 'Ms. Teacher'}
              </div>
              <div>
                <strong style={{ color: currentTheme.primary }}>Email:</strong><br />
                {section.data?.email || 'teacher@school.edu'}
              </div>
              <div>
                <strong style={{ color: currentTheme.primary }}>Room:</strong><br />
                {section.data?.room || 'Room 123'}
              </div>
              <div>
                <strong style={{ color: currentTheme.primary }}>Office Hours:</strong><br />
                {section.data?.officeHours || 'Mon-Fri 3:00-4:00 PM'}
              </div>
            </div>
          </div>
        );

      case 'image':
        return (
          <div key={index} className="text-center mb-6">
            {section.imageUrl ? (
              <div>
                <img 
                  src={section.imageUrl}
                  alt={section.imageAlt || 'Newsletter image'}
                  style={{ 
                    maxWidth: '100%',
                    height: 'auto',
                    borderRadius: '12px',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                  }}
                />
                {section.caption && (
                  <p 
                    style={{ 
                      fontFamily: currentTheme.fonts.body,
                      fontSize: '0.9rem',
                      color: currentTheme.secondary,
                      fontStyle: 'italic',
                      marginTop: '0.5rem'
                    }}
                  >
                    {section.caption}
                  </p>
                )}
              </div>
            ) : (
              <div 
                style={{ 
                  background: currentTheme.border,
                  padding: '3rem',
                  borderRadius: '12px',
                  color: currentTheme.secondary
                }}
              >
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🖼️</div>
                <p>Image placeholder</p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const formatContent = (content) => {
    if (!content) return '';
    
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; height: auto; border-radius: 8px; margin: 1rem 0;" />')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br />');
  };

  return (
    <div 
      ref={ref}
      style={{ 
        maxWidth: '8.5in',
        margin: '0 auto',
        padding: '1in',
        background: currentTheme.background,
        minHeight: '11in',
        boxShadow: '0 0 20px rgba(0,0,0,0.1)',
        fontFamily: currentTheme.fonts.body
      }}
    >
      {/* Newsletter Header */}
      <div 
        style={{ 
          textAlign: 'center',
          borderBottom: `3px solid ${currentTheme.primary}`,
          paddingBottom: '1rem',
          marginBottom: '2rem'
        }}
      >
        <h1 
          style={{ 
            fontFamily: currentTheme.fonts.heading,
            fontSize: '2.5rem',
            color: currentTheme.primary,
            margin: '0',
            textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          {title}
        </h1>
        <p 
          style={{ 
            fontFamily: currentTheme.fonts.body,
            color: currentTheme.secondary,
            fontSize: '1.1rem',
            margin: '0.5rem 0 0 0'
          }}
        >
          Week of {new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {/* Newsletter Sections */}
      {sections.map((section, index) => renderSection(section, index))}

      {/* Footer */}
      <div 
        style={{ 
          marginTop: '2rem',
          paddingTop: '1rem',
          borderTop: `2px solid ${currentTheme.border}`,
          textAlign: 'center',
          color: currentTheme.secondary,
          fontSize: '0.9rem'
        }}
      >
        <p>Thank you for being part of our classroom community! 📚</p>
      </div>
    </div>
  );
});

NewsletterPreview.displayName = 'NewsletterPreview';

export default NewsletterPreview;
