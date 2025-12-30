import { Bot } from 'grammy';
import { supabase } from '../lib/supabase';
import { config } from '../config';

export async function createProjectChat(
    bot: Bot,
    projectId: number,
    ownerId: string,
    projectName: string
): Promise<{ chatId: string; inviteLink: string }> {
    try {
        // Get owner's Telegram ID from telegram_users
        const { data: owner } = await supabase
            .from('telegram_users')
            .select('telegram_id')
            .eq('user_id', ownerId)
            .single();

        if (!owner) {
            throw new Error('Owner Telegram account not linked');
        }

        // Create Forum Topic in the Master Group
        const topic = await bot.api.createForumTopic(
            config.masterChatId,
            `${projectName} - Team Chat`
        );

        // Generate invite link (topic-specific link)
        const topicLink = `https://t.me/c/${config.masterChatId.toString().replace('-100', '')}/${topic.message_thread_id}`;

        // Store in project_chat_groups
        const { data: chatGroup, error: chatError } = await supabase
            .from('project_chat_groups')
            .insert({
                project_id: projectId,
                telegram_group_id: config.masterChatId.toString(),
                message_thread_id: topic.message_thread_id,
                invite_link: topicLink,
                created_by: ownerId
            })
            .select()
            .single();

        if (chatError || !chatGroup) {
            throw new Error(`Failed to create project chat group mapping: ${chatError?.message}`);
        }

        // Add owner as participant
        await supabase.from('chat_participants').insert({
            chat_group_id: chatGroup.id,
            message_thread_id: topic.message_thread_id,
            user_id: ownerId,
            telegram_user_id: owner.telegram_id,
            role: 'owner'
        });

        return { chatId: config.masterChatId.toString(), inviteLink: topicLink };
    } catch (error) {
        console.error('Error creating project chat topic:', error);
        throw error;
    }
}

export async function addWorkerToChat(
    bot: Bot,
    projectId: number,
    workerId: string
): Promise<void> {
    try {
        // Get chat group info
        const { data: chatGroup } = await supabase
            .from('project_chat_groups')
            .select('id, telegram_group_id, message_thread_id, invite_link')
            .eq('project_id', projectId)
            .single();

        if (!chatGroup) {
            throw new Error('Chat group not found for project');
        }

        // Get worker's Telegram info
        const { data: worker } = await supabase
            .from('telegram_users')
            .select('telegram_id')
            .eq('user_id', workerId)
            .single();

        if (!worker) {
            throw new Error('Worker Telegram account not linked');
        }

        // Add to participants
        await supabase.from('chat_participants').insert({
            chat_group_id: chatGroup.id,
            message_thread_id: chatGroup.message_thread_id,
            user_id: workerId,
            telegram_user_id: worker.telegram_id,
            role: 'worker'
        });

        // Send invite link and topic details to worker via Telegram
        await bot.api.sendMessage(
            worker.telegram_id,
            `You have been added to the team chat for project ID ${projectId}.\n\nJoin the discussion here: ${chatGroup.invite_link}`
        );
    } catch (error) {
        console.error('Error adding worker to chat:', error);
        throw error;
    }
}

export async function getChatLink(projectId: number): Promise<string | null> {
    const { data } = await supabase
        .from('project_chat_groups')
        .select('invite_link')
        .eq('project_id', projectId)
        .single();

    return data?.invite_link || null;
}
