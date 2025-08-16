-- Insert Global Templates for immediate teacher use
-- These templates provide common newsletter structures

-- Weekly Newsletter Template
INSERT INTO templates (
    id,
    user_id,
    name,
    description,
    content,
    settings,
    is_public,
    is_global
) VALUES (
    uuid_generate_v4(),
    (SELECT id FROM users WHERE email = 'mr.somers@school.edu' LIMIT 1),
    'Weekly Classroom Update',
    'A standard weekly newsletter template with all essential sections for classroom communication',
    '{
        "version": "1.0",
        "sections": [
            {
                "id": "title-1",
                "type": "title",
                "order": 0,
                "data": {
                    "title": "Weekly Update",
                    "subtitle": "Week of [Date]",
                    "style": {
                        "fontSize": "2xl",
                        "textAlign": "center",
                        "color": "#1f2937"
                    }
                }
            },
            {
                "id": "text-1", 
                "type": "richText",
                "order": 1,
                "data": {
                    "content": "Dear Families,\n\nWelcome to this week''s classroom update! Here''s what we''ve been learning and what''s coming up.",
                    "style": {
                        "fontSize": "base",
                        "textAlign": "left"
                    }
                }
            },
            {
                "id": "text-2",
                "type": "richText", 
                "order": 2,
                "data": {
                    "content": "**This Week We Learned:**\n• [Subject]: [Key concepts]\n• [Subject]: [Key concepts]\n• [Subject]: [Key concepts]",
                    "style": {
                        "fontSize": "base",
                        "textAlign": "left"
                    }
                }
            },
            {
                "id": "events-1",
                "type": "events",
                "order": 3,
                "data": {
                    "title": "Upcoming Events & Important Dates",
                    "events": [
                        {
                            "id": 1,
                            "date": "2024-01-15",
                            "title": "Parent-Teacher Conferences",
                            "description": "Schedule your conference online"
                        },
                        {
                            "id": 2,
                            "date": "2024-01-20",
                            "title": "Field Trip Permission Slips Due",
                            "description": "Science museum visit next month"
                        }
                    ]
                }
            },
            {
                "id": "text-3",
                "type": "richText",
                "order": 4,
                "data": {
                    "content": "**Homework Reminders:**\n• Math: Practice worksheets due Friday\n• Reading: Continue with chapter book\n• Science: Complete observation journal",
                    "style": {
                        "fontSize": "base",
                        "textAlign": "left"
                    }
                }
            },
            {
                "id": "contact-1",
                "type": "contact",
                "order": 5,
                "data": {
                    "title": "Contact Information",
                    "teacherName": "[Your Name]",
                    "email": "[your.email@school.edu]",
                    "phone": "[Phone Number]",
                    "room": "[Room Number]",
                    "officeHours": "Available before/after school or by appointment"
                }
            }
        ],
        "theme": {
            "primaryColor": "#3b82f6",
            "backgroundColor": "#ffffff",
            "fontFamily": "Inter, sans-serif"
        }
    }',
    '{
        "theme": {
            "primaryColor": "#3b82f6",
            "backgroundColor": "#ffffff", 
            "fontFamily": "Inter, sans-serif"
        }
    }',
    true,
    true
);

-- Simple Announcement Template
INSERT INTO templates (
    id,
    user_id,
    name,
    description,
    content,
    settings,
    is_public,
    is_global
) VALUES (
    uuid_generate_v4(),
    (SELECT id FROM users WHERE email = 'mr.somers@school.edu' LIMIT 1),
    'Quick Announcement',
    'Simple template for short announcements and updates',
    '{
        "version": "1.0",
        "sections": [
            {
                "id": "title-1",
                "type": "title",
                "order": 0,
                "data": {
                    "title": "Important Announcement",
                    "subtitle": "",
                    "style": {
                        "fontSize": "2xl",
                        "textAlign": "center",
                        "color": "#dc2626"
                    }
                }
            },
            {
                "id": "text-1",
                "type": "richText",
                "order": 1,
                "data": {
                    "content": "Dear Families,\n\n[Your important announcement goes here]\n\nThank you,\n[Your Name]",
                    "style": {
                        "fontSize": "base",
                        "textAlign": "left"
                    }
                }
            },
            {
                "id": "contact-1",
                "type": "contact",
                "order": 2,
                "data": {
                    "title": "Questions?",
                    "teacherName": "[Your Name]",
                    "email": "[your.email@school.edu]",
                    "phone": "[Phone Number]",
                    "room": "[Room Number]",
                    "officeHours": "Available before/after school"
                }
            }
        ],
        "theme": {
            "primaryColor": "#dc2626",
            "backgroundColor": "#ffffff",
            "fontFamily": "Inter, sans-serif"
        }
    }',
    '{
        "theme": {
            "primaryColor": "#dc2626",
            "backgroundColor": "#ffffff",
            "fontFamily": "Inter, sans-serif"
        }
    }',
    true,
    true
);

-- Event-Focused Template
INSERT INTO templates (
    id,
    user_id,
    name,
    description,
    content,
    settings,
    is_public,
    is_global
) VALUES (
    uuid_generate_v4(),
    (SELECT id FROM users WHERE email = 'mr.somers@school.edu' LIMIT 1),
    'Event & Field Trip Notice',
    'Perfect for field trips, special events, and activities requiring parent attention',
    '{
        "version": "1.0",
        "sections": [
            {
                "id": "title-1",
                "type": "title",
                "order": 0,
                "data": {
                    "title": "Special Event Notice",
                    "subtitle": "[Event Name & Date]",
                    "style": {
                        "fontSize": "2xl",
                        "textAlign": "center",
                        "color": "#059669"
                    }
                }
            },
            {
                "id": "text-1",
                "type": "richText",
                "order": 1,
                "data": {
                    "content": "Dear Families,\n\nWe are excited to announce an upcoming [event/field trip] that will enhance our learning experience!",
                    "style": {
                        "fontSize": "base",
                        "textAlign": "left"
                    }
                }
            },
            {
                "id": "events-1",
                "type": "events",
                "order": 2,
                "data": {
                    "title": "Event Details",
                    "events": [
                        {
                            "id": 1,
                            "date": "2024-02-15",
                            "title": "[Event Name]",
                            "description": "Time: [Time] | Location: [Location]"
                        },
                        {
                            "id": 2,
                            "date": "2024-02-10",
                            "title": "Permission Slips Due",
                            "description": "Please return signed forms by this date"
                        },
                        {
                            "id": 3,
                            "date": "2024-02-12",
                            "title": "Payment Due (if applicable)",
                            "description": "$[Amount] per student"
                        }
                    ]
                }
            },
            {
                "id": "text-2",
                "type": "richText",
                "order": 3,
                "data": {
                    "content": "**What to Bring:**\n• [Item 1]\n• [Item 2]\n• [Item 3]\n\n**What NOT to Bring:**\n• [Item 1]\n• [Item 2]",
                    "style": {
                        "fontSize": "base",
                        "textAlign": "left"
                    }
                }
            },
            {
                "id": "contact-1",
                "type": "contact",
                "order": 4,
                "data": {
                    "title": "Questions About This Event?",
                    "teacherName": "[Your Name]",
                    "email": "[your.email@school.edu]",
                    "phone": "[Phone Number]",
                    "room": "[Room Number]",
                    "officeHours": "Available for questions before/after school"
                }
            }
        ],
        "theme": {
            "primaryColor": "#059669",
            "backgroundColor": "#ffffff",
            "fontFamily": "Inter, sans-serif"
        }
    }',
    '{
        "theme": {
            "primaryColor": "#059669",
            "backgroundColor": "#ffffff",
            "fontFamily": "Inter, sans-serif"
        }
    }',
    true,
    true
);

-- Academic Progress Template
INSERT INTO templates (
    id,
    user_id,
    name,
    description,
    content,
    settings,
    is_public,
    is_global
) VALUES (
    uuid_generate_v4(),
    (SELECT id FROM users WHERE email = 'mr.somers@school.edu' LIMIT 1),
    'Academic Progress Update',
    'Template for sharing student progress, test results, and academic updates',
    '{
        "version": "1.0",
        "sections": [
            {
                "id": "title-1",
                "type": "title",
                "order": 0,
                "data": {
                    "title": "Academic Progress Report",
                    "subtitle": "[Quarter/Month] Update",
                    "style": {
                        "fontSize": "2xl",
                        "textAlign": "center",
                        "color": "#7c3aed"
                    }
                }
            },
            {
                "id": "text-1",
                "type": "richText",
                "order": 1,
                "data": {
                    "content": "Dear Parents and Guardians,\n\nI wanted to update you on your child''s academic progress and celebrate our recent learning achievements!",
                    "style": {
                        "fontSize": "base",
                        "textAlign": "left"
                    }
                }
            },
            {
                "id": "text-2",
                "type": "richText",
                "order": 2,
                "data": {
                    "content": "**Recent Test Results & Assessments:**\n• [Subject]: [Results/Comments]\n• [Subject]: [Results/Comments]\n• [Subject]: [Results/Comments]\n\n**Areas of Growth:**\n• [Strength 1]\n• [Strength 2]\n• [Strength 3]",
                    "style": {
                        "fontSize": "base",
                        "textAlign": "left"
                    }
                }
            },
            {
                "id": "text-3",
                "type": "richText",
                "order": 3,
                "data": {
                    "content": "**Areas to Focus On:**\n• [Goal 1]\n• [Goal 2]\n• [Goal 3]\n\n**How You Can Help at Home:**\n• [Suggestion 1]\n• [Suggestion 2]\n• [Suggestion 3]",
                    "style": {
                        "fontSize": "base",
                        "textAlign": "left"
                    }
                }
            },
            {
                "id": "events-1",
                "type": "events",
                "order": 4,
                "data": {
                    "title": "Upcoming Academic Events",
                    "events": [
                        {
                            "id": 1,
                            "date": "2024-03-01",
                            "title": "Parent-Teacher Conferences",
                            "description": "Discuss progress in detail"
                        },
                        {
                            "id": 2,
                            "date": "2024-03-15",
                            "title": "Next Assessment Period",
                            "description": "[Subject] tests and projects"
                        }
                    ]
                }
            },
            {
                "id": "contact-1",
                "type": "contact",
                "order": 5,
                "data": {
                    "title": "Let''s Discuss Your Child''s Progress",
                    "teacherName": "[Your Name]",
                    "email": "[your.email@school.edu]",
                    "phone": "[Phone Number]",
                    "room": "[Room Number]",
                    "officeHours": "Happy to schedule a meeting anytime"
                }
            }
        ],
        "theme": {
            "primaryColor": "#7c3aed",
            "backgroundColor": "#ffffff",
            "fontFamily": "Inter, sans-serif"
        }
    }',
    '{
        "theme": {
            "primaryColor": "#7c3aed",
            "backgroundColor": "#ffffff",
            "fontFamily": "Inter, sans-serif"
        }
    }',
    true,
    true
);

-- Log template creation activity
INSERT INTO activity_logs (
    action,
    resource_type,
    metadata
) VALUES (
    'global_templates_created',
    'system',
    '{"templates_count": 4, "template_types": ["weekly_update", "announcement", "event_notice", "academic_progress"]}'
);
