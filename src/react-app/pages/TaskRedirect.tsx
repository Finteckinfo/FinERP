import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { supabase } from '@/react-app/lib/supabase';

export default function TaskRedirect() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function resolveProject() {
            if (!id) return;

            try {
                const { data, error } = await supabase
                    .from('subtasks')
                    .select('project_id')
                    .eq('id', id)
                    .single();

                if (error) throw error;

                if (data && data.project_id) {
                    navigate(`/projects/${data.project_id}`, { replace: true });
                } else {
                    setError('Task not found');
                }
            } catch (err) {
                console.error('Error resolving task:', err);
                setError('Failed to resolve task location');
            }
        }

        resolveProject();
    }, [id, navigate]);

    if (error) {
        return (
            <div className="min-h-screen bg-[#050B18] flex items-center justify-center text-white">
                <div className="text-center">
                    <p className="text-red-400 mb-4">{error}</p>
                    <button
                        onClick={() => navigate('/')}
                        className="text-blue-400 hover:underline"
                    >
                        Go Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050B18] flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-[#0D99FF] border-t-transparent rounded-full animate-spin" />
        </div>
    );
}
