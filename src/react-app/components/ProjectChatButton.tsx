import { useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ProjectChatButtonProps {
    projectId: number;
}

export function ProjectChatButton({ projectId }: ProjectChatButtonProps) {
    const [chatLink, setChatLink] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchChatLink() {
            try {
                const { data } = await supabase
                    .from('project_chat_groups')
                    .select('invite_link')
                    .eq('project_id', projectId)
                    .single();

                setChatLink(data?.invite_link || null);
            } catch (error) {
                console.error('Error fetching chat link:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchChatLink();
    }, [projectId]);

    if (loading) {
        return (
            <div className="animate-pulse bg-gray-700 h-10 w-32 rounded-lg"></div>
        );
    }

    if (!chatLink) {
        return null;
    }

    return (
        <a
            href={chatLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
        >
            <MessageCircle className="w-4 h-4" />
            Open Team Chat
        </a>
    );
}
