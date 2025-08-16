/**
 * Global Templates Creator
 * Creates professional newsletter templates for immediate use
 */

const Template = require('../models/Template');
const User = require('../models/User');
const logger = require('../utils/logger');

// Global templates that will be available to all users
const globalTemplates = [
  {
    name: "Weekly Classroom Update",
    description: "Perfect for regular weekly newsletters with class updates, upcoming events, and parent reminders.",
    content: {
      version: "1.0",
      sections: [
        {
          id: "section-title-1",
          type: "title",
          order: 0,
          data: {
            title: "Weekly Classroom Update",
            subtitle: "Week of [DATE]",
            style: {
              fontSize: "2xl",
              textAlign: "center",
              color: "#1f2937"
            }
          }
        },
        {
          id: "section-text-1",
          type: "richText",
          order: 1,
          data: {
            content: "Welcome to this week's newsletter! Here's what's happening in our classroom...",
            style: {
              fontSize: "base",
              textAlign: "left"
            }
          }
        },
        {
          id: "section-events-1",
          type: "events",
          order: 2,
          data: {
            title: "This Week's Schedule",
            events: [
              {
                id: 1,
                date: new Date().toISOString().split('T')[0],
                title: "Math Quiz",
                description: "Chapter 4 multiplication tables"
              },
              {
                id: 2,
                date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                title: "Library Visit",
                description: "Students will select new books for reading"
              }
            ]
          }
        },
        {
          id: "section-text-2",
          type: "richText",
          order: 3,
          data: {
            content: "**Homework This Week:**\n• Complete math worksheet (due Wednesday)\n• Read 20 minutes each night\n• Science project due Friday\n\n**Reminders:**\n• Please send water bottles daily\n• Field trip permission slips due Monday",
            style: {
              fontSize: "base",
              textAlign: "left"
            }
          }
        },
        {
          id: "section-contact-1",
          type: "contact",
          order: 4,
          data: {
            title: "Questions or Concerns?",
            teacherName: "Ms. Teacher",
            email: "teacher@school.edu",
            phone: "(555) 123-4567",
            room: "Room 101",
            officeHours: "Available before school (7:30-8:00 AM) or by appointment"
          }
        }
      ]
    },
    settings: {
      theme: {
        primaryColor: "#3b82f6",
        backgroundColor: "#ffffff",
        fontFamily: "Inter, sans-serif"
      }
    }
  },
  
  {
    name: "Quick Announcement",
    description: "Simple template for urgent announcements, reminders, or quick updates to parents.",
    content: {
      version: "1.0",
      sections: [
        {
          id: "section-title-1",
          type: "title",
          order: 0,
          data: {
            title: "Important Announcement",
            subtitle: "",
            style: {
              fontSize: "2xl",
              textAlign: "center",
              color: "#dc2626"
            }
          }
        },
        {
          id: "section-text-1",
          type: "richText",
          order: 1,
          data: {
            content: "**Quick Update for Parents:**\n\n[Your announcement here - keep it brief and clear]\n\n**Action Required:** [If parents need to do something]\n\n**Questions?** Please reach out via email or phone.",
            style: {
              fontSize: "lg",
              textAlign: "left"
            }
          }
        },
        {
          id: "section-contact-1",
          type: "contact",
          order: 2,
          data: {
            title: "Contact Information",
            teacherName: "Ms. Teacher",
            email: "teacher@school.edu",
            phone: "(555) 123-4567",
            room: "Room 101",
            officeHours: "Available for calls after 3:00 PM"
          }
        }
      ]
    },
    settings: {
      theme: {
        primaryColor: "#dc2626",
        backgroundColor: "#ffffff",
        fontFamily: "Inter, sans-serif"
      }
    }
  },
  
  {
    name: "Event & Field Trip Notice",
    description: "Perfect for field trips, special events, or activities that require parent coordination.",
    content: {
      version: "1.0",
      sections: [
        {
          id: "section-title-1",
          type: "title",
          order: 0,
          data: {
            title: "Special Event Notice",
            subtitle: "[Event Name & Date]",
            style: {
              fontSize: "2xl",
              textAlign: "center",
              color: "#059669"
            }
          }
        },
        {
          id: "section-text-1",
          type: "richText",
          order: 1,
          data: {
            content: "We're excited to announce an upcoming [event/field trip] for our class!\n\n**Event Details:**\n• **What:** [Event description]\n• **When:** [Date and time]\n• **Where:** [Location]\n• **Cost:** [Any fees required]\n• **What to bring:** [Items students should bring]",
            style: {
              fontSize: "base",
              textAlign: "left"
            }
          }
        },
        {
          id: "section-events-1",
          type: "events",
          order: 2,
          data: {
            title: "Important Dates",
            events: [
              {
                id: 1,
                date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                title: "Permission Slips Due",
                description: "Return signed forms and payment"
              },
              {
                id: 2,
                date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                title: "Event Day",
                description: "Meet at school by 8:00 AM"
              }
            ]
          }
        },
        {
          id: "section-text-2",
          type: "richText",
          order: 3,
          data: {
            content: "**Permission Slip Required:**\nPlease complete and return the attached permission slip along with payment by [date].\n\n**Volunteer Opportunities:**\nWe need [number] parent volunteers for this trip. Please let me know if you're available to help!\n\n**Questions?**\nDon't hesitate to reach out with any concerns.",
            style: {
              fontSize: "base",
              textAlign: "left"
            }
          }
        },
        {
          id: "section-contact-1",
          type: "contact",
          order: 4,
          data: {
            title: "Questions About This Event?",
            teacherName: "Ms. Teacher",
            email: "teacher@school.edu",
            phone: "(555) 123-4567",
            room: "Room 101",
            officeHours: "Available for questions before/after school"
          }
        }
      ]
    },
    settings: {
      theme: {
        primaryColor: "#059669",
        backgroundColor: "#ffffff",
        fontFamily: "Inter, sans-serif"
      }
    }
  },
  
  {
    name: "Academic Progress Update",
    description: "Great for mid-semester updates, progress reports, or academic milestone communications.",
    content: {
      version: "1.0",
      sections: [
        {
          id: "section-title-1",
          type: "title",
          order: 0,
          data: {
            title: "Academic Progress Update",
            subtitle: "[Quarter/Semester] Report",
            style: {
              fontSize: "2xl",
              textAlign: "center",
              color: "#7c3aed"
            }
          }
        },
        {
          id: "section-text-1",
          type: "richText",
          order: 1,
          data: {
            content: "Dear Parents,\n\nI wanted to share an update on your child's academic progress this [quarter/semester]. Overall, our class has been working hard and making great strides!\n\n**What We've Covered:**\n• [Subject 1]: [Topics covered]\n• [Subject 2]: [Topics covered]\n• [Subject 3]: [Topics covered]",
            style: {
              fontSize: "base",
              textAlign: "left"
            }
          }
        },
        {
          id: "section-text-2",
          type: "richText",
          order: 2,
          data: {
            content: "**Upcoming Assessments:**\n• [Test/Quiz 1] - [Date]\n• [Test/Quiz 2] - [Date]\n• [Project Due Date] - [Date]\n\n**How You Can Help at Home:**\n• Review [specific skills] with your child\n• Practice [specific activities] for 15 minutes daily\n• Check homework folder each night\n• Read together for 20 minutes",
            style: {
              fontSize: "base",
              textAlign: "left"
            }
          }
        },
        {
          id: "section-events-1",
          type: "events",
          order: 3,
          data: {
            title: "Important Academic Dates",
            events: [
              {
                id: 1,
                date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                title: "Progress Reports Sent Home",
                description: "Individual progress reports in folders"
              },
              {
                id: 2,
                date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                title: "Parent-Teacher Conferences",
                description: "Sign up for individual meetings"
              }
            ]
          }
        },
        {
          id: "section-contact-1",
          type: "contact",
          order: 4,
          data: {
            title: "Let's Discuss Your Child's Progress",
            teacherName: "Ms. Teacher",
            email: "teacher@school.edu",
            phone: "(555) 123-4567",
            room: "Room 101",
            officeHours: "Available for conferences by appointment"
          }
        }
      ]
    },
    settings: {
      theme: {
        primaryColor: "#7c3aed",
        backgroundColor: "#ffffff",
        fontFamily: "Inter, sans-serif"
      }
    }
  }
];

/**
 * Create global templates
 * This should be run by a super admin user
 */
async function createGlobalTemplates() {
  try {
    logger.info('Starting global template creation...');
    
    // Find super admin user (or create if needed)
    let adminUser = await User.findByEmail('admin@somersclassroom.com');
    if (!adminUser) {
      logger.info('Creating admin user for global templates...');
      adminUser = await User.create({
        email: 'admin@somersclassroom.com',
        password: 'secure-admin-password-' + Date.now(),
        firstName: 'System',
        lastName: 'Administrator',
        school: 'Somers Classroom Newsletter',
        subjects: ['Administration'],
        gradeLevel: 'All Grades',
        isAdmin: true
      });
    }
    
    logger.info(`Using admin user: ${adminUser.id}`);
    
    // Create each global template
    for (const templateData of globalTemplates) {
      try {
        const template = await Template.create({
          ...templateData,
          isGlobal: true,
          isPublic: true
        }, adminUser.id);
        
        logger.info(`Created global template: ${template.name} (${template.id})`);
      } catch (error) {
        logger.error(`Error creating template "${templateData.name}":`, error);
      }
    }
    
    logger.info('Global template creation complete!');
    
  } catch (error) {
    logger.error('Error in global template creation:', error);
    throw error;
  }
}

module.exports = {
  createGlobalTemplates,
  globalTemplates
};

// Run if called directly
if (require.main === module) {
  createGlobalTemplates()
    .then(() => {
      logger.info('Global templates created successfully!');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Failed to create global templates:', error);
      process.exit(1);
    });
}
