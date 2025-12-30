import { useState, useEffect } from 'react';
import type { Project } from '@/shared/types';
import { supabase } from '@/react-app/lib/supabase';

/**
 * Hook for admin to view all projects in the system
 */
export function useAllProjects() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setProjects((data as unknown as Project[]) || []);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    return { projects, loading, error, refetch: fetchProjects };
}

/**
 * Hook for assignee to view only their assigned projects
 */
export function useAssignedProjects(userId: string | null) {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProjects = async () => {
        if (!userId) {
            setProjects([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);

            // Get projects where user has assigned subtasks
            const { data, error } = await supabase
                .from('subtasks')
                .select('project_id, projects(*)')
                .eq('assigned_to', userId);

            if (error) throw error;

            // Extract unique projects
            const projectsMap = new Map<number, Project>();
            (data as unknown as { project_id: number; projects: Project[] }[])?.forEach(item => {
                if (item.projects && Array.isArray(item.projects) && item.projects.length > 0) {
                    const project = item.projects[0];
                    projectsMap.set(project.id, project);
                }
            });

            setProjects(Array.from(projectsMap.values()));
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, [userId]);

    return { projects, loading, error, refetch: fetchProjects };
}
