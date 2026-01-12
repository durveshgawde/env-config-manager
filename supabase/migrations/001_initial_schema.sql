-- Environment Configuration Manager - Initial Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: configs
-- Stores logical configuration entities (e.g., "auth-service", "payment-config")
CREATE TABLE IF NOT EXISTS configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: config_versions
-- Stores immutable version history for each config per environment
-- Every change creates a new row - NEVER update existing versions
CREATE TABLE IF NOT EXISTS config_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    config_id UUID NOT NULL REFERENCES configs(id) ON DELETE CASCADE,
    environment TEXT NOT NULL CHECK (environment IN ('dev', 'staging', 'prod')),
    version_number INT NOT NULL,
    data JSONB NOT NULL,
    message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by TEXT,
    -- Ensure unique version per config per environment
    UNIQUE(config_id, environment, version_number)
);

-- Index for fast version lookups
CREATE INDEX IF NOT EXISTS idx_versions_lookup 
ON config_versions(config_id, environment, version_number DESC);

-- Index for environment-based queries
CREATE INDEX IF NOT EXISTS idx_versions_environment 
ON config_versions(environment);

-- Comments for documentation
COMMENT ON TABLE configs IS 'Logical configuration entities';
COMMENT ON TABLE config_versions IS 'Immutable version history - never update, always insert';
COMMENT ON COLUMN config_versions.data IS 'Full JSON configuration data for this version';
COMMENT ON COLUMN config_versions.message IS 'Human-readable description of this version change';

-- Example usage (optional - remove in production):
-- INSERT INTO configs (name) VALUES ('auth-service');
-- INSERT INTO config_versions (config_id, environment, version_number, data, message, created_by)
-- SELECT id, 'dev', 1, '{"JWT_SECRET": "dev-secret", "TOKEN_EXPIRY": 3600}'::jsonb, 'Initial config', 'admin'
-- FROM configs WHERE name = 'auth-service';
