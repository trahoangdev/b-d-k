-- =====================================================
-- Big Data Keeper - Quick Database Setup
-- =====================================================
-- Simple script to create database and user
-- Run as PostgreSQL superuser

-- Create database
CREATE DATABASE big_data_keeper;

-- Create user
CREATE USER big_data_keeper_user WITH PASSWORD 'big_data_keeper_password_2024';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE big_data_keeper TO big_data_keeper_user;

-- Connect to database
\c big_data_keeper;

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO big_data_keeper_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO big_data_keeper_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO big_data_keeper_user;

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Success message
SELECT 'Database setup completed! Use Prisma to create tables.' as message;
