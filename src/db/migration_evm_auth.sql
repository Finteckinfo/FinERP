-- Migration to support EVM Wallet Addresses as User IDs
-- Run this in your Supabase SQL Editor

-- 0. DROP CONFLICTING POLICIES
-- The "Enable update for own user data" policy depends on (auth.uid() = id).
-- Since we are changing 'id' from UUID to TEXT, we must drop this policy first.
DROP POLICY IF EXISTS "Enable update for own user data" ON users;

-- 1. Drop foreign key constraints that reference users.id
ALTER TABLE user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_fkey;
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_assigned_to_fkey;
ALTER TABLE task_attachments DROP CONSTRAINT IF EXISTS task_attachments_uploaded_by_fkey;

-- 2. Alter users table id to TEXT (to store wallet addresses like '0x123...')
ALTER TABLE users ALTER COLUMN id DROP DEFAULT;
ALTER TABLE users ALTER COLUMN id TYPE TEXT USING id::text;

-- 3. Alter referencing columns to TEXT
ALTER TABLE projects ALTER COLUMN owner_id TYPE TEXT USING owner_id::text;
ALTER TABLE projects ALTER COLUMN user_id TYPE TEXT USING user_id::text;
ALTER TABLE user_roles ALTER COLUMN user_id TYPE TEXT USING user_id::text;
ALTER TABLE tasks ALTER COLUMN assigned_to TYPE TEXT USING assigned_to::text;
ALTER TABLE task_attachments ALTER COLUMN uploaded_by TYPE TEXT USING uploaded_by::text;

-- 4. Re-add Foreign Key constraints
ALTER TABLE user_roles ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE tasks ADD CONSTRAINT tasks_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE task_attachments ADD CONSTRAINT task_attachments_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL;

-- 5. Notes on RLS
-- The previous policy used `auth.uid() = id`. `auth.uid()` returns a Supabase Auth UUID.
-- Your new `id` is an EVM address string. They will not match.
-- To secure user updates, you'll need to implement a new RLS strategy (e.g., custom claims or backend proxy) 
-- compatible with your wallet authentication method.
