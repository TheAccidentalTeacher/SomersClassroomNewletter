-- Newsletter Generator Database Schema
-- Professional schema for PostgreSQL with proper constraints and indexes

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (authentication and profile data)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    school VARCHAR(100),
    subjects TEXT[],
    grade_levels TEXT[],
    is_admin BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP WITH TIME ZONE,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT users_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT users_display_name_length CHECK (length(display_name) >= 2)
);

-- User sessions table (JWT token management)
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    device_info JSONB,
    ip_address INET,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT sessions_expires_future CHECK (expires_at > created_at)
);

-- Templates table
CREATE TABLE IF NOT EXISTS templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    content JSONB NOT NULL,
    settings JSONB NOT NULL DEFAULT '{}',
    thumbnail_url VARCHAR(500),
    is_public BOOLEAN DEFAULT FALSE,
    is_global BOOLEAN DEFAULT FALSE,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT templates_name_length CHECK (length(name) >= 3),
    CONSTRAINT templates_content_required CHECK (content IS NOT NULL)
);

-- Newsletters table
CREATE TABLE IF NOT EXISTS newsletters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    template_id UUID REFERENCES templates(id) ON DELETE SET NULL,
    title VARCHAR(300) NOT NULL,
    content JSONB NOT NULL,
    settings JSONB NOT NULL DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'draft',
    publish_date TIMESTAMP WITH TIME ZONE,
    last_exported TIMESTAMP WITH TIME ZONE,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT newsletters_title_length CHECK (length(title) >= 3),
    CONSTRAINT newsletters_status_valid CHECK (status IN ('draft', 'published', 'archived')),
    CONSTRAINT newsletters_content_required CHECK (content IS NOT NULL)
);

-- Newsletter shares table
CREATE TABLE IF NOT EXISTS newsletter_shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    newsletter_id UUID NOT NULL REFERENCES newsletters(id) ON DELETE CASCADE,
    shared_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    shared_with UUID REFERENCES users(id) ON DELETE CASCADE,
    share_type VARCHAR(50) NOT NULL,
    permissions JSONB DEFAULT '{"view": true, "edit": false, "copy": false}',
    access_token VARCHAR(255),
    expires_at TIMESTAMP WITH TIME ZONE,
    accessed_count INTEGER DEFAULT 0,
    last_accessed TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT shares_type_valid CHECK (share_type IN ('user', 'link', 'email')),
    CONSTRAINT shares_user_or_token CHECK (
        (share_type = 'user' AND shared_with IS NOT NULL) OR
        (share_type IN ('link', 'email') AND access_token IS NOT NULL)
    )
);

-- Activity logs table
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id UUID,
    metadata JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT logs_action_not_empty CHECK (length(action) > 0),
    CONSTRAINT logs_resource_type_valid CHECK (
        resource_type IN ('user', 'newsletter', 'template', 'share', 'export', 'auth', 'system')
    )
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_users_admin ON users(is_admin) WHERE is_admin = true;
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON user_sessions(token_hash);

CREATE INDEX IF NOT EXISTS idx_templates_user_id ON templates(user_id);
CREATE INDEX IF NOT EXISTS idx_templates_public ON templates(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_templates_global ON templates(is_global) WHERE is_global = true;
CREATE INDEX IF NOT EXISTS idx_templates_created_at ON templates(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_newsletters_user_id ON newsletters(user_id);
CREATE INDEX IF NOT EXISTS idx_newsletters_template_id ON newsletters(template_id);
CREATE INDEX IF NOT EXISTS idx_newsletters_status ON newsletters(status);
CREATE INDEX IF NOT EXISTS idx_newsletters_created_at ON newsletters(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_newsletters_updated_at ON newsletters(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_shares_newsletter_id ON newsletter_shares(newsletter_id);
CREATE INDEX IF NOT EXISTS idx_shares_shared_by ON newsletter_shares(shared_by);
CREATE INDEX IF NOT EXISTS idx_shares_shared_with ON newsletter_shares(shared_with);
CREATE INDEX IF NOT EXISTS idx_shares_token ON newsletter_shares(access_token) WHERE access_token IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_logs_action ON activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_logs_resource ON activity_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_logs_created_at ON activity_logs(created_at DESC);

-- Functions to automatically update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic timestamp updates
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_templates_updated_at ON templates;
CREATE TRIGGER update_templates_updated_at 
    BEFORE UPDATE ON templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_newsletters_updated_at ON newsletters;
CREATE TRIGGER update_newsletters_updated_at 
    BEFORE UPDATE ON newsletters
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM user_sessions WHERE expires_at < NOW();
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Insert default super admin user (Mr. Somers)
-- Password: 'admin123' - CHANGE THIS IMMEDIATELY AFTER FIRST LOGIN
INSERT INTO users (
    email, 
    password_hash, 
    display_name, 
    school, 
    is_admin, 
    is_active, 
    email_verified
) VALUES (
    'mr.somers@school.edu',
    '$2a$12$rqw3.A7RcdobsIH5UHV4LeWgtpzIiwTBmMDuXB0PdkKCOeR.KFNdO', -- 'admin123' hashed correctly
    'Mr. Somers',
    'District School',
    true,
    true,
    true
) ON CONFLICT (email) DO NOTHING;

-- Log the schema creation
INSERT INTO activity_logs (
    action,
    resource_type,
    metadata
) VALUES (
    'schema_created',
    'system',
    '{"version": "1.0.0", "tables_created": ["users", "user_sessions", "templates", "newsletters", "newsletter_shares", "activity_logs"]}'
);
