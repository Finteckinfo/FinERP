-- Migration: Setup Project Chat Tables with Forum Topic Support
-- This script creates the required tables if they don't exist and ensures all columns are present.

-- 1. Create project_chat_groups (if not exists)
CREATE TABLE IF NOT EXISTS project_chat_groups (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  project_id BIGINT REFERENCES projects(id) ON DELETE CASCADE,
  telegram_group_id TEXT NOT NULL,
  message_thread_id BIGINT, -- Required for Forum Topics
  invite_link TEXT,
  created_by TEXT REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Ensure message_thread_id exists if table was already created
ALTER TABLE project_chat_groups ADD COLUMN IF NOT EXISTS message_thread_id BIGINT;

-- 2. Create chat_participants (if not exists)
CREATE TABLE IF NOT EXISTS chat_participants (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  chat_group_id BIGINT REFERENCES project_chat_groups(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(id),
  telegram_user_id TEXT NOT NULL,
  message_thread_id BIGINT, -- Required for Forum Topics
  role TEXT DEFAULT 'member', -- 'owner', 'worker', 'observer'
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Ensure message_thread_id exists if table was already created
ALTER TABLE chat_participants ADD COLUMN IF NOT EXISTS message_thread_id BIGINT;

-- 3. Create telegram_users mapping table (if not exists)
CREATE TABLE IF NOT EXISTS telegram_users (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  telegram_id BIGINT UNIQUE NOT NULL,
  telegram_username TEXT,
  telegram_first_name TEXT,
  telegram_last_name TEXT,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'assignee' CHECK (role IN ('admin', 'assignee')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Migration completed: Project chat tables are set up with Forum Topic support.';
END $$;
