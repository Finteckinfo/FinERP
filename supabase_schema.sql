-- FinPro Supabase Schema
-- Supporting EVM Wallet Addresses and Full RLS
-- Run this in your Supabase SQL Editor

-- 0. CLEAN SLATE (Optional but recommended if encountering type mismatch errors)
-- Note: This will remove existing project data.
DROP TABLE IF EXISTS task_attachments CASCADE;
DROP TABLE IF EXISTS subtask_reviews CASCADE;
DROP TABLE IF EXISTS subtasks CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS token_transactions CASCADE;
DROP TABLE IF EXISTS swap_transactions CASCADE;
DROP TABLE IF EXISTS token_balances CASCADE;

-- 1. Users Table (Stores user profiles linked to wallet addresses)
-- Handle existing users table safely
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'users') THEN
    CREATE TABLE users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE,
      full_name TEXT,
      avatar_url TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  ELSE
    -- Alter existing users table to support wallet addresses
    ALTER TABLE users ALTER COLUMN id DROP DEFAULT;
    ALTER TABLE users ALTER COLUMN id TYPE TEXT USING id::text;
    ALTER TABLE users ALTER COLUMN email DROP NOT NULL;
    
    -- Add TON blockchain support
    ALTER TABLE users ADD COLUMN IF NOT EXISTS ton_address TEXT;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_chain TEXT DEFAULT 'EVM';
    ALTER TABLE users ADD COLUMN IF NOT EXISTS ton_wallet_version TEXT;
  END IF;
END $$;

-- 2. Projects Table
CREATE TABLE IF NOT EXISTS projects (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'PROGRESSIVE',
  priority TEXT DEFAULT 'MEDIUM',
  owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  on_chain_id TEXT,
  escrow_address TEXT,
  escrow_funded BOOLEAN DEFAULT FALSE,
  total_funds DOUBLE PRECISION NOT NULL DEFAULT 0,
  allocated_funds DOUBLE PRECISION NOT NULL DEFAULT 0,
  released_funds DOUBLE PRECISION NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  start_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  end_date TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP + INTERVAL '30 days'),
  wallet_address TEXT,
  user_id TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  allow_guests BOOLEAN DEFAULT FALSE,
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Subtasks Table
CREATE TABLE IF NOT EXISTS subtasks (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  assigned_to TEXT REFERENCES users(id) ON DELETE SET NULL,
  allocated_amount DOUBLE PRECISION NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Subtask Reviews Table
CREATE TABLE IF NOT EXISTS subtask_reviews (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  subtask_id BIGINT NOT NULL REFERENCES subtasks(id) ON DELETE CASCADE,
  reviewer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL, -- 'approved' | 'rejected'
  comments TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. User Roles Table
CREATE TABLE IF NOT EXISTS user_roles (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Task Attachments Table
CREATE TABLE IF NOT EXISTS task_attachments (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  subtask_id BIGINT NOT NULL REFERENCES subtasks(id) ON DELETE CASCADE,
  uploaded_by TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Token Balances
CREATE TABLE IF NOT EXISTS token_balances (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_type TEXT NOT NULL,
  balance DOUBLE PRECISION NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_token_balances_user_token ON token_balances(user_id, token_type);

-- 8. Swap Transactions
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

-- 9. Token Transactions
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

-- 10. Atomic increment function for project funds
CREATE OR REPLACE FUNCTION allocate_project_funds(p_project_id BIGINT, p_amount DOUBLE PRECISION)
RETURNS void AS $$
BEGIN
  UPDATE projects
  SET allocated_funds = allocated_funds + p_amount,
      updated_at = CURRENT_TIMESTAMP
  WHERE id = p_project_id;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 11. Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE subtasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE subtask_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE swap_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_transactions ENABLE ROW LEVEL SECURITY;

-- 12. RLS Policies (Providing public access for wallet-based operations)
-- In a production app, these would be restricted by auth.uid() if using Supabase Auth,
-- but since we are using custom wallet-based auth logic (anon role with manual checks/profiles),
-- we allow public (anon) access consistent with the project requirements.

DROP POLICY IF EXISTS "Public Users Access" ON users;
CREATE POLICY "Public Users Access" ON users FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Projects Access" ON projects;
CREATE POLICY "Public Projects Access" ON projects FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Tasks Access" ON subtasks;
CREATE POLICY "Public Tasks Access" ON subtasks FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Reviews Access" ON subtask_reviews;
CREATE POLICY "Public Reviews Access" ON subtask_reviews FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public User Roles Access" ON user_roles;
CREATE POLICY "Public User Roles Access" ON user_roles FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Task Attachments Access" ON task_attachments;
CREATE POLICY "Public Task Attachments Access" ON task_attachments FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Token Balances Access" ON token_balances;
CREATE POLICY "Public Token Balances Access" ON token_balances FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Swap Transactions Access" ON swap_transactions;
CREATE POLICY "Public Swap Transactions Access" ON swap_transactions FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Token Transactions Access" ON token_transactions;
CREATE POLICY "Public Token Transactions Access" ON token_transactions FOR ALL TO anon USING (true) WITH CHECK (true);

-- 13. Cross-Chain Transaction Tracking
CREATE TABLE IF NOT EXISTS cross_chain_transactions (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id TEXT REFERENCES users(id),
  source_chain TEXT NOT NULL, -- 'TON' or 'EVM'
  dest_chain TEXT,
  tx_hash TEXT NOT NULL,
  operation_type TEXT NOT NULL, -- 'project_create', 'fund_transfer', 'reward', etc.
  amount DOUBLE PRECISION,
  metadata JSONB,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cross_chain_tx_hash ON cross_chain_transactions(tx_hash);
CREATE INDEX IF NOT EXISTS idx_cross_chain_user ON cross_chain_transactions(user_id);

-- 14. On-Chain Data Mirror for Transparency
CREATE TABLE IF NOT EXISTS on_chain_data_mirror (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  chain TEXT NOT NULL, -- 'TON' or 'EVM'
  contract_address TEXT NOT NULL,
  data_type TEXT NOT NULL, -- 'project', 'subtask', 'payment', etc.
  reference_id BIGINT, -- Links to projects.id, subtasks.id, etc.
  on_chain_hash TEXT NOT NULL, -- Transaction or cell hash
  data_snapshot JSONB NOT NULL, -- Full data stored on-chain
  block_number BIGINT,
  synced_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_mirror_reference ON on_chain_data_mirror(data_type, reference_id);
CREATE INDEX IF NOT EXISTS idx_mirror_chain ON on_chain_data_mirror(chain, contract_address);

-- 15. Project Chat Groups (Telegram Integration)
CREATE TABLE IF NOT EXISTS project_chat_groups (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  project_id BIGINT REFERENCES projects(id) ON DELETE CASCADE,
  telegram_group_id TEXT NOT NULL,
  invite_link TEXT,
  created_by TEXT REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chat_project ON project_chat_groups(project_id);

-- 16. Chat Participants
CREATE TABLE IF NOT EXISTS chat_participants (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  chat_group_id BIGINT REFERENCES project_chat_groups(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(id),
  telegram_user_id TEXT NOT NULL,
  role TEXT DEFAULT 'member', -- 'owner', 'worker', 'observer'
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chat_participants ON chat_participants(chat_group_id, user_id);

-- 17. Enable RLS on new tables
ALTER TABLE cross_chain_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE on_chain_data_mirror ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_chat_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_participants ENABLE ROW LEVEL SECURITY;

-- 18. RLS Policies for new tables
DROP POLICY IF EXISTS "Public Cross Chain Access" ON cross_chain_transactions;
CREATE POLICY "Public Cross Chain Access" ON cross_chain_transactions FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Data Mirror Access" ON on_chain_data_mirror;
CREATE POLICY "Public Data Mirror Access" ON on_chain_data_mirror FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Chat Groups Access" ON project_chat_groups;
CREATE POLICY "Public Chat Groups Access" ON project_chat_groups FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Chat Participants Access" ON chat_participants;
CREATE POLICY "Public Chat Participants Access" ON chat_participants FOR ALL TO anon USING (true) WITH CHECK (true);
