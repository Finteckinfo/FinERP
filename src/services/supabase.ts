/**
 * Supabase Database Service
 * Provides database access using Supabase client
 * 
 * NOTE: This app uses Supabase-only authentication.
 * No external SSO providers are used.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.V_SUPABASE_ANON_K || import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase: SupabaseClient | null = null;

// Always use Supabase-only mode when configured
const isSupabaseOnly = true;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
  console.log('[Supabase] Client initialized successfully');
} else {
  console.warn('[Supabase] Environment variables not set. Please configure VITE_SUPABASE_URL and V_SUPABASE_ANON_K');
}

export { supabase, isSupabaseOnly, isSupabaseOnly as isSupabaseConfigured };

// Database helper functions
export const db = {
  /**
   * User operations
   */
  users: {
    async getByEmail(email: string) {
      if (!supabase) return { data: null, error: new Error('Supabase not configured') };
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
      return { data, error };
    },

    async getById(id: string) {
      if (!supabase) return { data: null, error: new Error('Supabase not configured') };
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();
      return { data, error };
    },

    async create(userData: {
      email: string;
      wallet_address?: string;
      first_name?: string;
      last_name?: string;
    }) {
      if (!supabase) return { data: null, error: new Error('Supabase not configured') };
      const { data, error } = await supabase
        .from('users')
        .insert([userData])
        .select()
        .single();
      return { data, error };
    },

    async update(id: string, updates: Partial<{
      wallet_address: string;
      first_name: string;
      last_name: string;
    }>) {
      if (!supabase) return { data: null, error: new Error('Supabase not configured') };
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    },
  },

  /**
   * Project operations
   */
  projects: {
    async getByOwner(ownerId: string) {
      if (!supabase) return { data: null, error: new Error('Supabase not configured') };
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('owner_id', ownerId)
        .order('created_at', { ascending: false });
      return { data, error };
    },

    async getById(id: string) {
      if (!supabase) return { data: null, error: new Error('Supabase not configured') };
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();
      return { data, error };
    },

    async create(projectData: {
      owner_id: string;
      title: string;
      description?: string;
      budget?: number;
      escrow_address?: string;
    }) {
      if (!supabase) return { data: null, error: new Error('Supabase not configured') };
      const { data, error } = await supabase
        .from('projects')
        .insert([projectData])
        .select()
        .single();
      return { data, error };
    },

    async update(id: string, updates: Partial<{
      title: string;
      description: string;
      budget: number;
      status: string;
      escrow_address: string;
    }>) {
      if (!supabase) return { data: null, error: new Error('Supabase not configured') };
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    },

    async delete(id: string) {
      if (!supabase) return { data: null, error: new Error('Supabase not configured') };
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);
      return { error };
    },
  },

  /**
   * Task operations
   */
  tasks: {
    async getByProject(projectId: string) {
      if (!supabase) return { data: null, error: new Error('Supabase not configured') };
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
      return { data, error };
    },

    async getById(id: string) {
      if (!supabase) return { data: null, error: new Error('Supabase not configured') };
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', id)
        .single();
      return { data, error };
    },

    async create(taskData: {
      project_id: string;
      title: string;
      description?: string;
      status?: string;
      assigned_to?: string;
      payment_amount?: number;
      payment_status?: string;
    }) {
      if (!supabase) return { data: null, error: new Error('Supabase not configured') };
      const { data, error } = await supabase
        .from('tasks')
        .insert([{
          ...taskData,
          status: taskData.status || 'pending',
        }])
        .select()
        .single();
      return { data, error };
    },

    async update(id: string, updates: Partial<{
      title: string;
      description: string;
      status: string;
      assigned_to: string;
      payment_amount: number;
      payment_status: string;
    }>) {
      if (!supabase) return { data: null, error: new Error('Supabase not configured') };
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    },

    async delete(id: string) {
      if (!supabase) return { data: null, error: new Error('Supabase not configured') };
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);
      return { error };
    },
  },
};

