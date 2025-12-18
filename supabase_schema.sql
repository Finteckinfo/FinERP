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

-- 5. Additional Tables for FinPro (Migrated from D1)

CREATE TABLE IF NOT EXISTS token_balances (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_type TEXT NOT NULL,
  balance DOUBLE PRECISION NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_token_balances_user_token ON token_balances(user_id, token_type);

CREATE TABLE IF NOT EXISTS swap_transactions (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  from_token TEXT NOT NULL,
  to_token TEXT NOT NULL,
  from_amount DOUBLE PRECISION NOT NULL,
  to_amount DOUBLE PRECISION NOT NULL,
  exchange_rate DOUBLE PRECISION NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_swap_transactions_user ON swap_transactions(user_id);

CREATE TABLE IF NOT EXISTS token_transactions (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_type TEXT NOT NULL,
  amount DOUBLE PRECISION NOT NULL,
  transaction_type TEXT NOT NULL,
  reference_id BIGINT,
  reference_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_token_transactions_user ON token_transactions(user_id);

-- Atomic increment function for project funds
CREATE OR REPLACE FUNCTION allocate_project_funds(p_project_id BIGINT, p_amount DOUBLE PRECISION)
RETURNS void AS $$
BEGIN
  UPDATE projects
  SET allocated_funds = allocated_funds + p_amount,
      updated_at = CURRENT_TIMESTAMP
  WHERE id = p_project_id;
END;
$$ LANGUAGE plpgsql;

-- RLS Policies (Basic examples, need refinement based on exact requirements)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE swap_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_transactions ENABLE ROW LEVEL SECURITY;

-- Note: Policies using auth.uid() need custom logic if not using Supabase Auth.
-- If using EVM wallet auth via custom backend or signed messages, 
-- you might use request headers or JWT claims to verify identity.
