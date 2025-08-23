-- Database initialization script for Docker
-- This file runs when the PostgreSQL container starts for the first time

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create database if not exists (this might not be needed in Docker context)
-- The database is created automatically from POSTGRES_DB environment variable

-- Run migrations
\i /docker-entrypoint-initdb.d/001_initial_setup.sql

-- Run seeds (optional, comment out for production)
-- \i /docker-entrypoint-initdb.d/001_sample_data.sql