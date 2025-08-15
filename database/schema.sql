-- Database schema for Supabase

-- Enable RLS (Row Level Security)
ALTER DATABASE postgres SET row_security = on;

-- Users table is automatically created by Supabase Auth
-- We'll create a profiles table to extend user information

CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    display_name TEXT,
    school TEXT,
    subjects TEXT[],
    preferences JSONB DEFAULT '{}',
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Templates table
CREATE TABLE templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    content JSONB NOT NULL,
    settings JSONB NOT NULL,
    is_public BOOLEAN DEFAULT FALSE,
    is_global BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Newsletters table
CREATE TABLE newsletters (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    content JSONB NOT NULL,
    template_id UUID REFERENCES templates(id) ON DELETE SET NULL,
    settings JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Newsletter shares table
CREATE TABLE newsletter_shares (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    newsletter_id UUID REFERENCES newsletters(id) ON DELETE CASCADE NOT NULL,
    shared_by UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    share_type TEXT NOT NULL CHECK (share_type IN ('link', 'email', 'download')),
    recipients TEXT[],
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity log table
CREATE TABLE activity_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_newsletters_user_id ON newsletters(user_id);
CREATE INDEX idx_newsletters_created_at ON newsletters(created_at DESC);
CREATE INDEX idx_templates_user_id ON templates(user_id);
CREATE INDEX idx_templates_is_public ON templates(is_public);
CREATE INDEX idx_newsletter_shares_newsletter_id ON newsletter_shares(newsletter_id);
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- RLS Policies

-- Profiles: Users can only see and edit their own profile
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Newsletters: Users can only see and edit their own newsletters
ALTER TABLE newsletters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own newsletters" ON newsletters
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create newsletters" ON newsletters
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own newsletters" ON newsletters
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own newsletters" ON newsletters
    FOR DELETE USING (auth.uid() = user_id);

-- Templates: Users can see public templates and their own private templates
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view public templates and their own" ON templates
    FOR SELECT USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can create templates" ON templates
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own templates" ON templates
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own templates" ON templates
    FOR DELETE USING (auth.uid() = user_id);

-- Newsletter shares: Users can view shares for their newsletters
ALTER TABLE newsletter_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view shares for their newsletters" ON newsletter_shares
    FOR SELECT USING (
        auth.uid() = shared_by OR 
        auth.uid() IN (
            SELECT user_id FROM newsletters WHERE id = newsletter_id
        )
    );

CREATE POLICY "Users can create shares for their newsletters" ON newsletter_shares
    FOR INSERT WITH CHECK (
        auth.uid() = shared_by AND
        auth.uid() IN (
            SELECT user_id FROM newsletters WHERE id = newsletter_id
        )
    );

-- Activity logs: Users can only see their own activity
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own activity" ON activity_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create activity logs" ON activity_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Functions to automatically update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_newsletters_updated_at BEFORE UPDATE ON newsletters
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create a profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, display_name)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert some default global templates (run after setting up admin user)
INSERT INTO templates (user_id, name, description, content, settings, is_public, is_global) VALUES
(
    '00000000-0000-0000-0000-000000000000', -- Replace with actual admin user ID
    'Basic Weekly Newsletter',
    'A simple weekly newsletter template with standard sections',
    '{
        "title": "Weekly Newsletter",
        "sections": [
            {
                "id": "title",
                "type": "title", 
                "title": "Week of [Date]",
                "order": 0
            },
            {
                "id": "highlights",
                "type": "highlights",
                "title": "This Week''s Highlights",
                "content": "What we accomplished this week...",
                "order": 1
            },
            {
                "id": "upcoming",
                "type": "upcoming-events",
                "title": "Coming Up Next Week",
                "content": "What to look forward to...",
                "order": 2
            },
            {
                "id": "contact",
                "type": "contact-info",
                "title": "Contact Information",
                "content": "Questions? Contact me at...",
                "order": 3
            }
        ]
    }',
    '{
        "theme": {
            "primaryColor": "#3b82f6",
            "secondaryColor": "#64748b",
            "accentColor": "#10b981",
            "backgroundColor": "#ffffff",
            "textColor": "#1f2937",
            "fontFamily": "Inter"
        },
        "layout": {
            "columns": 1,
            "spacing": 16,
            "margin": 24,
            "headerHeight": 80,
            "footerHeight": 60
        },
        "export": {
            "paperSize": "letter",
            "orientation": "portrait",
            "includeHeader": true,
            "includeFooter": true
        }
    }',
    true,
    true
);
