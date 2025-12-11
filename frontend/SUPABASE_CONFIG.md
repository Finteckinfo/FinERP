# Your Supabase Configuration

## Supabase Project Details

**Project URL**: `REPLACE_WITH_YOUR_SUPABASE_URL`

## Next Steps

### 1. Get Your API Keys

1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/REPLACE_WITH_YOUR_PROJECT_ID
2. Navigate to **Settings** → **API**
3. Copy these values:
   - **Project URL**: `REPLACE_WITH_YOUR_SUPABASE_URL` (replace with your actual URL)
   - **anon/public key**: (starts with `eyJ...`) - Copy this!

### 2. Set Up Database Schema

**Option A: Safe Version (Recommended - handles existing tables)**
1. In Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy and paste the SQL from `SUPABASE_SCHEMA_SAFE.sql` file
4. Click "Run"

**Option B: If you get "policy already exists" error**
1. Use the safe version above (it drops existing policies first)
2. Or use `SUPABASE_SCHEMA_FRESH.sql` if you want to start completely fresh (WARNING: deletes all data)

**Quick Fix for Existing Policies:**
If you just need to fix the policies, run this:

```sql
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  wallet_address VARCHAR(255),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  budget DECIMAL(18, 2),
  status VARCHAR(50) DEFAULT 'active',
  escrow_address VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  assigned_to UUID REFERENCES users(id),
  payment_amount DECIMAL(18, 2),
  payment_status VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_owner ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned ON tasks(assigned_to);
```

4. Click "Run" to execute the SQL

### 3. Configure Row Level Security (Optional)

For testing, you can allow all operations. Later, you can restrict access:

```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- For testing: Allow all operations (remove in production)
CREATE POLICY "Allow all operations" ON users FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON projects FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON tasks FOR ALL USING (true);
```

### 4. Environment Variables

**For Local Development:**
Your `.env.local` file has been created with your Supabase credentials.

**For Netlify Deployment:**
See `NETLIFY_ENV_VARS.md` for the complete list of environment variables to add in Netlify dashboard.

Required Supabase variables:
```
VITE_SUPABASE_URL=REPLACE_WITH_YOUR_SUPABASE_URL
VITE_SUPABASE_ANON_KEY=REPLACE_WITH_YOUR_SUPABASE_ANON_KEY
VITE_BACKEND_URL=REPLACE_WITH_YOUR_SUPABASE_URL
VITE_API_URL=REPLACE_WITH_YOUR_SUPABASE_URL/rest/v1
```

### 5. Local Development

For local development, create `frontend/.env.local`:

```bash
VITE_SUPABASE_URL=https://haslirlxxyrllbaytwop.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_BACKEND_URL=https://haslirlxxyrllbaytwop.supabase.co
VITE_API_URL=https://haslirlxxyrllbaytwop.supabase.co/rest/v1
```

## Testing the Connection

After setting up, you can test the connection in your code:

```typescript
import { db } from '@/services/supabase';

// Test: Create a user
const { data, error } = await db.users.create({
  email: 'test@example.com',
  wallet_address: '0x123...',
  first_name: 'Test',
  last_name: 'User'
});

if (error) {
  console.error('Error:', error);
} else {
  console.log('User created:', data);
}
```

## Verify Tables Created

1. Go to **Table Editor** in Supabase dashboard
2. You should see three tables:
   - `users`
   - `projects`
   - `tasks`

## Dashboard Link

Your Supabase dashboard: https://supabase.com/dashboard/project/REPLACE_WITH_YOUR_PROJECT_ID

