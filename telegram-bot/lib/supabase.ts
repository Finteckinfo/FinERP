import { createClient } from '@supabase/supabase-js';
import { config } from '../config';

const { url, serviceKey } = config.supabase;

if (!url || !serviceKey) {
    console.warn('Supabase configuration is missing. Database features will be disabled.');
}

// Create Supabase client with service role key for backend operations
// This bypasses Row Level Security (RLS) policies
export const supabase = createClient(
    url || 'https://placeholder.supabase.co',
    serviceKey || 'placeholder-key',
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);
