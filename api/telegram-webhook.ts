import type { VercelRequest, VercelResponse } from '@vercel/node';
import TelegramBot from 'node-telegram-bot-api';
import { createClient } from '@supabase/supabase-js';
import { handleStart, handleProjects, handleHelp } from '../telegram-bot/handlers/commands.js';
import { handleMessage } from '../telegram-bot/handlers/messages.js';

// Initialize bot (without polling for serverless)
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN!, { polling: false });

// Initialize Supabase
const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const update = req.body;

        // Handle different types of updates
        if (update.message) {
            const message = update.message;

            // Handle commands
            if (message.text?.startsWith('/')) {
                const command = message.text.split(' ')[0].substring(1);

                switch (command) {
                    case 'start':
                        await handleStart(bot, message);
                        break;
                    case 'projects':
                        await handleProjects(bot, message, supabase);
                        break;
                    case 'help':
                        await handleHelp(bot, message);
                        break;
                    default:
                        await bot.sendMessage(message.chat.id, 'Unknown command. Use /help to see available commands.');
                }
            } else {
                // Handle regular messages
                await handleMessage(bot, message, supabase);
            }
        }

        res.status(200).json({ ok: true });
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
