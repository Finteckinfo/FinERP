import { useState, useEffect } from 'react';
import type { Project } from '@/shared/types';
import { supabase } from '@/react-app/lib/supabase';
import { useWallet } from '@/react-app/hooks/useWallet';

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { account } = useWallet();

  const fetchProjects = async () => {
    try {
      setLoading(true);

      // If no account connected, return empty list or handle as needed
      if (!account) {
        setProjects([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('owner_id', account) // Filter by wallet address
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [account]); // Re-fetch when account changes

  return { projects, loading, error, refetch: fetchProjects };
}

export function useProject(id: string) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { account } = useWallet();

  const fetchProject = async () => {
    try {
      setLoading(true);

      if (!account) {
        setProject(null);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .eq('owner_id', account) // Security: Ensure user owns the project
        .single();

      if (error) throw error;
      setProject(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id && account) {
      fetchProject();
    }
  }, [id, account]);

  return { project, loading, error, refetch: fetchProject };
}
