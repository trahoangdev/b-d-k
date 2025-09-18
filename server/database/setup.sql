-- =====================================================
-- Big Data Keeper - PostgreSQL Database Setup Script
-- =====================================================
-- This script creates the database, user, and initial setup
-- Run this script as a PostgreSQL superuser (postgres)

-- =====================================================
-- 1. CREATE DATABASE AND USER
-- =====================================================

-- Create database
CREATE DATABASE big_data_keeper
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.UTF-8'
    LC_CTYPE = 'en_US.UTF-8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1
    IS_TEMPLATE = False;

-- Create user for the application
CREATE USER big_data_keeper_user WITH PASSWORD 'big_data_keeper_password_2024';

-- Grant privileges to the user
GRANT ALL PRIVILEGES ON DATABASE big_data_keeper TO big_data_keeper_user;

-- Connect to the database
\c big_data_keeper;

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO big_data_keeper_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO big_data_keeper_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO big_data_keeper_user;

-- Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO big_data_keeper_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO big_data_keeper_user;

-- =====================================================
-- 2. CREATE EXTENSIONS
-- =====================================================

-- Enable UUID extension for generating UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto for password hashing functions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enable unaccent for text search (optional)
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- =====================================================
-- 3. CREATE ENUMS
-- =====================================================

-- User roles enum
CREATE TYPE user_role AS ENUM ('ADMIN', 'USER', 'MODERATOR');

-- Analytics types enum
CREATE TYPE analytics_type AS ENUM (
    'FILE_UPLOAD',
    'FILE_DOWNLOAD', 
    'FILE_DELETE',
    'FILE_SHARE',
    'USER_LOGIN',
    'USER_LOGOUT',
    'FOLDER_CREATE',
    'FOLDER_DELETE',
    'SYSTEM_EVENT'
);

-- =====================================================
-- 4. CREATE TABLES
-- =====================================================

-- Users table
CREATE TABLE users (
    id TEXT PRIMARY KEY DEFAULT 'user_' || substr(md5(random()::text), 1, 8),
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    password TEXT NOT NULL,
    avatar TEXT,
    role user_role DEFAULT 'USER',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Folders table
CREATE TABLE folders (
    id TEXT PRIMARY KEY DEFAULT 'folder_' || substr(md5(random()::text), 1, 8),
    name TEXT NOT NULL,
    path TEXT UNIQUE NOT NULL,
    description TEXT,
    parent_id TEXT REFERENCES folders(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Files table
CREATE TABLE files (
    id TEXT PRIMARY KEY DEFAULT 'file_' || substr(md5(random()::text), 1, 8),
    name TEXT NOT NULL,
    original_name TEXT NOT NULL,
    path TEXT UNIQUE NOT NULL,
    size BIGINT NOT NULL,
    mime_type TEXT NOT NULL,
    extension TEXT NOT NULL,
    hash TEXT UNIQUE NOT NULL,
    description TEXT,
    tags TEXT[] DEFAULT '{}',
    is_public BOOLEAN DEFAULT false,
    folder_id TEXT REFERENCES folders(id) ON DELETE SET NULL,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics table
CREATE TABLE analytics (
    id TEXT PRIMARY KEY DEFAULT 'analytics_' || substr(md5(random()::text), 1, 8),
    type analytics_type NOT NULL,
    action TEXT NOT NULL,
    details JSONB,
    user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    file_id TEXT REFERENCES files(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shares table
CREATE TABLE shares (
    id TEXT PRIMARY KEY DEFAULT 'share_' || substr(md5(random()::text), 1, 8),
    token TEXT UNIQUE NOT NULL,
    file_id TEXT NOT NULL REFERENCES files(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TIMESTAMP WITH TIME ZONE,
    password TEXT,
    max_downloads INTEGER,
    download_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System configuration table
CREATE TABLE system_config (
    id TEXT PRIMARY KEY DEFAULT 'config_' || substr(md5(random()::text), 1, 8),
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    type TEXT DEFAULT 'string',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 5. CREATE INDEXES
-- =====================================================

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);

-- Folders indexes
CREATE INDEX idx_folders_user_id ON folders(user_id);
CREATE INDEX idx_folders_parent_id ON folders(parent_id);
CREATE INDEX idx_folders_path ON folders(path);
CREATE INDEX idx_folders_name ON folders(name);

-- Files indexes
CREATE INDEX idx_files_user_id ON files(user_id);
CREATE INDEX idx_files_folder_id ON files(folder_id);
CREATE INDEX idx_files_hash ON files(hash);
CREATE INDEX idx_files_mime_type ON files(mime_type);
CREATE INDEX idx_files_extension ON files(extension);
CREATE INDEX idx_files_is_public ON files(is_public);
CREATE INDEX idx_files_uploaded_at ON files(uploaded_at);
CREATE INDEX idx_files_tags ON files USING GIN(tags);
CREATE INDEX idx_files_name_search ON files USING GIN(to_tsvector('english', name));
CREATE INDEX idx_files_description_search ON files USING GIN(to_tsvector('english', description));

-- Analytics indexes
CREATE INDEX idx_analytics_user_id ON analytics(user_id);
CREATE INDEX idx_analytics_file_id ON analytics(file_id);
CREATE INDEX idx_analytics_type ON analytics(type);
CREATE INDEX idx_analytics_created_at ON analytics(created_at);

-- Shares indexes
CREATE INDEX idx_shares_token ON shares(token);
CREATE INDEX idx_shares_file_id ON shares(file_id);
CREATE INDEX idx_shares_user_id ON shares(user_id);
CREATE INDEX idx_shares_expires_at ON shares(expires_at);
CREATE INDEX idx_shares_is_active ON shares(is_active);

-- System config indexes
CREATE INDEX idx_system_config_key ON system_config(key);

-- =====================================================
-- 6. CREATE TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_folders_updated_at BEFORE UPDATE ON folders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_files_updated_at BEFORE UPDATE ON files
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_config_updated_at BEFORE UPDATE ON system_config
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 7. INSERT INITIAL DATA
-- =====================================================

-- Insert system configuration
INSERT INTO system_config (key, value, type) VALUES
('max_file_size', '2147483648', 'number'),
('allowed_file_types', 'pdf,doc,docx,xls,xlsx,ppt,pptx,zip,jpg,jpeg,png,gif,mp4,avi,mov', 'string'),
('max_files_per_upload', '10', 'number'),
('storage_quota', '107374182400', 'number'),
('maintenance_mode', 'false', 'boolean'),
('app_name', 'Big Data Keeper', 'string'),
('app_version', '1.0.0', 'string'),
('app_description', 'Big Data Keeper - Quản lý và lưu trữ dữ liệu lớn', 'string');

-- Insert admin user (password: admin123)
INSERT INTO users (email, username, first_name, last_name, password, role) VALUES
('admin@bigdatakeeper.com', 'admin', 'Admin', 'User', crypt('admin123', gen_salt('bf', 12)), 'ADMIN');

-- Insert test user (password: user123)
INSERT INTO users (email, username, first_name, last_name, password, role) VALUES
('user@bigdatakeeper.com', 'testuser', 'Test', 'User', crypt('user123', gen_salt('bf', 12)), 'USER');

-- Get user IDs for folder creation
DO $$
DECLARE
    admin_id TEXT;
    user_id TEXT;
BEGIN
    SELECT id INTO admin_id FROM users WHERE email = 'admin@bigdatakeeper.com';
    SELECT id INTO user_id FROM users WHERE email = 'user@bigdatakeeper.com';
    
    -- Create root folders
    INSERT INTO folders (name, path, description, user_id) VALUES
    ('Root', '/root', 'Root folder for all files', admin_id),
    ('Root', '/root', 'Root folder for all files', user_id);
    
    -- Create Documents folders
    INSERT INTO folders (name, path, description, parent_id, user_id) 
    SELECT 'Documents', '/root/Documents', 'Document files', f.id, f.user_id
    FROM folders f WHERE f.path = '/root';
    
    -- Create Images folders
    INSERT INTO folders (name, path, description, parent_id, user_id) 
    SELECT 'Images', '/root/Images', 'Image files', f.id, f.user_id
    FROM folders f WHERE f.path = '/root';
    
    -- Create Projects folders
    INSERT INTO folders (name, path, description, parent_id, user_id) 
    SELECT 'Projects', '/root/Projects', 'Project files', f.id, f.user_id
    FROM folders f WHERE f.path = '/root';
END $$;

-- =====================================================
-- 8. CREATE VIEWS
-- =====================================================

-- User statistics view
CREATE VIEW user_stats AS
SELECT 
    u.id,
    u.email,
    u.username,
    u.first_name,
    u.last_name,
    u.role,
    u.created_at,
    COUNT(DISTINCT f.id) as file_count,
    COUNT(DISTINCT fo.id) as folder_count,
    COALESCE(SUM(f.size), 0) as total_size,
    COUNT(DISTINCT s.id) as share_count
FROM users u
LEFT JOIN files f ON u.id = f.user_id
LEFT JOIN folders fo ON u.id = fo.user_id
LEFT JOIN shares s ON u.id = s.user_id
GROUP BY u.id, u.email, u.username, u.first_name, u.last_name, u.role, u.created_at;

-- File statistics view
CREATE VIEW file_stats AS
SELECT 
    DATE_TRUNC('day', uploaded_at) as date,
    COUNT(*) as file_count,
    SUM(size) as total_size,
    COUNT(DISTINCT user_id) as unique_users
FROM files
GROUP BY DATE_TRUNC('day', uploaded_at)
ORDER BY date DESC;

-- Storage usage view
CREATE VIEW storage_usage AS
SELECT 
    COUNT(*) as total_files,
    SUM(size) as total_size,
    AVG(size) as avg_file_size,
    MAX(size) as max_file_size,
    MIN(size) as min_file_size
FROM files;

-- =====================================================
-- 9. CREATE FUNCTIONS
-- =====================================================

-- Function to get folder path
CREATE OR REPLACE FUNCTION get_folder_path(folder_id TEXT)
RETURNS TEXT AS $$
DECLARE
    result TEXT;
BEGIN
    WITH RECURSIVE folder_path AS (
        SELECT id, name, parent_id, name as path
        FROM folders
        WHERE id = folder_id
        
        UNION ALL
        
        SELECT f.id, f.name, f.parent_id, f.name || '/' || fp.path
        FROM folders f
        JOIN folder_path fp ON f.id = fp.parent_id
    )
    SELECT '/' || path INTO result
    FROM folder_path
    WHERE parent_id IS NULL;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user can access file
CREATE OR REPLACE FUNCTION can_access_file(user_id TEXT, file_id TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    file_owner TEXT;
    file_public BOOLEAN;
BEGIN
    SELECT f.user_id, f.is_public INTO file_owner, file_public
    FROM files f
    WHERE f.id = file_id;
    
    IF file_owner IS NULL THEN
        RETURN FALSE;
    END IF;
    
    IF file_owner = user_id OR file_public THEN
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 10. GRANT FINAL PERMISSIONS
-- =====================================================

-- Grant all privileges on all tables
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO big_data_keeper_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO big_data_keeper_user;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO big_data_keeper_user;

-- Grant privileges on views
GRANT SELECT ON user_stats TO big_data_keeper_user;
GRANT SELECT ON file_stats TO big_data_keeper_user;
GRANT SELECT ON storage_usage TO big_data_keeper_user;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'Big Data Keeper Database Setup Completed Successfully!';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'Database: big_data_keeper';
    RAISE NOTICE 'User: big_data_keeper_user';
    RAISE NOTICE 'Password: big_data_keeper_password_2024';
    RAISE NOTICE '';
    RAISE NOTICE 'Default Admin User:';
    RAISE NOTICE '  Email: admin@bigdatakeeper.com';
    RAISE NOTICE '  Password: admin123';
    RAISE NOTICE '';
    RAISE NOTICE 'Default Test User:';
    RAISE NOTICE '  Email: user@bigdatakeeper.com';
    RAISE NOTICE '  Password: user123';
    RAISE NOTICE '';
    RAISE NOTICE 'Connection String:';
    RAISE NOTICE 'postgresql://big_data_keeper_user:big_data_keeper_password_2024@localhost:5432/big_data_keeper';
    RAISE NOTICE '=====================================================';
END $$;
