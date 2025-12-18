-- FinPro Supabase Schema
-- Supporting EVM Wallet Addresses and Full RLS

-- 1. Users Table (Stores user profiles linked to wallet addresses)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY, -- EVM Wallet Address (lower-cased)
  email TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Ensure email is nullable for wallet-only auth
ALTER TABLE users ALTER COLUMN email DROP NOT NULL;

-- 2. Projects Table
CREATE TABLE IF NOT EXISTS projects (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL,
  description TEXT,
  owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total_funds DOUBLE PRECISION NOT NULL DEFAULT 0,
  allocated_funds DOUBLE PRECISION NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
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
$$ LANGUAGE plpgsql;

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
