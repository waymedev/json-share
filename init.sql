-- MySQL initialization script for JSON-Share application

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS json_share;
USE json_share;

-- Create raw_json table
CREATE TABLE IF NOT EXISTS raw_json (
  id BIGINT NOT NULL AUTO_INCREMENT,
  json_content JSON NOT NULL,
  ref_count INT NOT NULL DEFAULT 1,
  PRIMARY KEY (id)
);

-- Create index on ref_count
CREATE INDEX idx_ref_count ON raw_json (ref_count);

-- Create user_files table
CREATE TABLE IF NOT EXISTS user_files (
  id BIGINT NOT NULL AUTO_INCREMENT,
  file_name VARCHAR(255) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  json_id BIGINT NOT NULL,
  share_id VARCHAR(64),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expired_at BIGINT NOT NULL,
  is_shared TINYINT NOT NULL DEFAULT 0,
  PRIMARY KEY (id)
);

-- Create indexes
CREATE INDEX idx_user_id ON user_files (user_id);
CREATE UNIQUE INDEX idx_share_id ON user_files (share_id);

-- Add comments to explain the tables
-- user_files: Stores metadata about user's JSON files including sharing status and expiration
--   - share_id: Unique identifier used for generating share links
-- json_files: Stores the actual JSON content with reference counting for efficient storage management
