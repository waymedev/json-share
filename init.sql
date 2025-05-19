-- MySQL initialization script for JSON-Share application

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS json_share;
USE json_share;

-- JSON File Table (must be created first due to foreign key reference)
CREATE TABLE IF NOT EXISTS json_files (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    json_content JSON NOT NULL,
    ref_count INT NOT NULL DEFAULT 1,

    -- Index for better query performance
    INDEX idx_ref_count (ref_count)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User File Table
CREATE TABLE IF NOT EXISTS user_files (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    json_id BIGINT NOT NULL,
    share_id VARCHAR(64),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expire_at BIGINT NOT NULL DEFAULT 0,
    is_shared BOOLEAN NOT NULL DEFAULT FALSE,

    -- Indexes for better query performance
    INDEX idx_user_id (user_id),
    UNIQUE INDEX idx_share_id (share_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add comments to explain the tables
-- user_files: Stores metadata about user's JSON files including sharing status and expiration
--   - share_id: Unique identifier used for generating share links
-- json_files: Stores the actual JSON content with reference counting for efficient storage management
