import { Context } from 'grammy';
import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Handle regular text messages
 * Routes messages between admin and assignees
 */
export async function handleMessage(
    ctx: Context,
    supabase: SupabaseClient
) {
    const telegramId = ctx.from?.id;

    if (!telegramId) {
        return;
    }

    try {
        // Get user from telegram_users
        const { data: telegramUser } = await supabase
            .from('telegram_users')
            .select('user_id, role')
            .eq('telegram_id', telegramId)
            .single();

        if (!telegramUser) {
            await ctx.reply(
                'Your account is not linked. Please use /start to get started.'
            );
            return;
        }

        // For now, just acknowledge the message
        // In a full implementation, this would handle message routing
        await ctx.reply(
            'Message received! For full messaging features, please use the app.',
            {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: 'Open Messaging',
                                web_app: { url: process.env.TELEGRAM_MINI_APP_URL || '' }
                            }
                        ]
                    ]
                }
            }
        );
    } catch (error) {
        console.error('Error handling message:', error);
    }
}
