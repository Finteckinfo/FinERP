import 'dotenv/config';
import TelegramBot from 'node-telegram-bot-api';
import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { config, validateConfig } from './config.js';
import { handleStart, handleProjects, handleHelp, handleTasks, handleProfile, handleStats, handlePing, registerCommands } from './handlers/commands.js';
import { handleMessage } from './handlers/messages.js';

// Validate configuration on startup
validateConfig();

// Initialize Telegram Bot
const bot = new TelegramBot(config.botToken);

// Initialize Supabase client with service key for admin operations
const supabase = createClient(config.supabase.url, config.supabase.serviceKey);

// Initialize Express server for webhook
const app = express();
app.use(express.json());

import { handleSupabaseWebhook } from './handlers/webhooks.js';

// Webhook endpoint
app.post('/webhook', async (req: express.Request, res: express.Response) => {
    try {
        const payload = req.body;

        // 1. Detect if this is a Supabase Webhook
        if (payload.record && payload.table && payload.type) {
            console.log('Supabase Webhook detected:', payload.table, payload.type);
            await handleSupabaseWebhook(bot, supabase, payload);
            return res.sendStatus(200);
        }

        // 2. Handle Telegram Bot Updates
        if (payload.message) {
            const message = payload.message;
            const chatId = message.chat.id;
            const text = message.text || '';

            // Handle commands
            if (text.startsWith('/')) {
                switch (text.split(' ')[0]) {
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
                        await bot.sendMessage(chatId, 'Unknown command. Type /help for available commands.');
                }
            } else {
                // Handle regular messages
                await handleMessage(bot, message, supabase);
            }
        }

        res.sendStatus(200);
    } catch (error) {
        console.error('Webhook error:', error);
        res.sendStatus(500);
    }
});

// Health check endpoint
app.get('/health', (req: express.Request, res: express.Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(config.port, async () => {
    console.log(`Telegram bot server running on port ${config.port}`);

    // Register commands with Telegram
    await registerCommands(bot);

    // Set webhook
    try {
        await bot.setWebHook(`${config.webhookUrl}/webhook`);
        console.log(`Webhook set to: ${config.webhookUrl}/webhook`);
    } catch (error) {
        console.error('Failed to set webhook:', error);
    }
});

// Export for use in other modules
export { bot, supabase };
