import TelegramBot from 'node-telegram-bot-api';
import { createClient } from '@supabase/supabase-js';

// Initialize bot (without polling for serverless)
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN || '', { polling: false });

// Initialize Supabase
const supabase = createClient(
    process.env.VITE_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_KEY || ''
);

import {
    handleStart,
    handleProjects,
    handleHelp,
    handleTasks,
    handleProfile,
    handleStats,
    handlePing
} from '../telegram-bot/handlers/commands.js';
import { handleSupabaseWebhook as sharedHandleSupabaseWebhook } from '../telegram-bot/handlers/webhooks.js';

export default async function handler(req: any, res: any) {
    console.log('Webhook received:', JSON.stringify(req.body, null, 2));

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const payload = req.body;

        // 1. Detect if this is a Supabase Webhook
        if (payload.record && payload.table && payload.type) {
            console.log('Supabase Webhook detected:', payload.table, payload.type);
            await sharedHandleSupabaseWebhook(bot, supabase, payload);
            return res.status(200).json({ ok: true });
        }

        // 2. Handle Telegram Bot Updates
        if (payload.message) {
            const message = payload.message;

            // Handle commands
            if (message.text && message.text.startsWith('/')) {
                const text = message.text;
                const command = text.split(' ')[0];
                console.log('Command received:', command);

                switch (command) {
                    case '/start':
                        await handleStart(bot, message, supabase);
                        break;
                    case '/projects':
                        await handleProjects(bot, message, supabase);
                        break;
                    case '/tasks':
                        await handleTasks(bot, message, supabase);
                        break;
                    case '/profile':
                        await handleProfile(bot, message, supabase);
                        break;
                    case '/stats':
                        await handleStats(bot, message, supabase);
                        break;
                    case '/ping':
                        await handlePing(bot, message);
                        break;
                    case '/help':
                        await handleHelp(bot, message);
                        break;
                    default:
                        await bot.sendMessage(message.chat.id, 'Unknown command. Use /help to see available commands.');
                }
            }
        }

        res.status(200).json({ ok: true });
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// Local handleProjectsCommand removed in favor of shared handler
