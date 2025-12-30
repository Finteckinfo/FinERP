import 'dotenv/config';
import { Bot, webhookCallback } from 'grammy';
import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { config, validateConfig } from './config.js';
import {
    handleStart,
    handleProjects,
    handleHelp,
    handleTasks,
    handleProfile,
    handleStats,
    handlePing,
    handleBalance,
    handleBroadcast,
    registerCommands
} from './handlers/commands.js';
import { handleMessage } from './handlers/messages.js';
import { handleSupabaseWebhook } from './handlers/webhooks.js';

// Validate configuration on startup
validateConfig();

// Initialize Telegram Bot
const bot = new Bot(config.botToken);

// Initialize Supabase client with service key for admin operations
const supabase = createClient(config.supabase.url, config.supabase.serviceKey);

// Initialize Express server for webhook
const app = express();
app.use(express.json());

// Command Handlers
bot.command('start', (ctx) => handleStart(ctx, supabase));
bot.command('projects', (ctx) => handleProjects(ctx, supabase));
bot.command('tasks', (ctx) => handleTasks(ctx, supabase));
bot.command('profile', (ctx) => handleProfile(ctx, supabase));
bot.command('balance', (ctx) => handleBalance(ctx, supabase));
bot.command('broadcast', (ctx) => handleBroadcast(ctx, supabase));
bot.command('stats', (ctx) => handleStats(ctx, supabase));
bot.command('ping', (ctx) => handlePing(ctx));
bot.command('help', (ctx) => handleHelp(ctx));

// Handle other messages
bot.on('message:text', (ctx) => handleMessage(ctx, supabase));

// Webhook endpoint for Supabase
app.post('/webhook', async (req: express.Request, res: express.Response) => {
    try {
        const payload = req.body;

        // Detect if this is a Supabase Webhook
        if (payload.record && payload.table && payload.type) {
            console.log('Supabase Webhook detected:', payload.table, payload.type);
            await handleSupabaseWebhook(bot.api, supabase, payload);
            return res.sendStatus(200);
        }

        res.sendStatus(200);
    } catch (error) {
        console.error('Webhook error:', error);
        res.sendStatus(500);
    }
});

// Start server
const startServer = async () => {
    // 1. Register commands with Telegram
    await registerCommands(bot.api);

    // 2. Decide update method (Webhook vs Polling)
    const usePolling = process.env.TELEGRAM_USE_POLLING === 'true';

    if (usePolling) {
        console.log('Starting bot in POLLING mode...');
        // Delete any existing webhook before starting polling
        await bot.api.deleteWebhook({ drop_pending_updates: true });

        // Start polling
        bot.start();

        // Start Express server ONLY for Supabase webhooks and health checks
        app.listen(config.port, () => {
            console.log(`Express server running on port ${config.port} (Supabase Webhooks & Health - NO Bot Webhook)`);
        });

    } else {
        // WEBHOOK MODE

        // Attach the webhook callback to Express ONLY in webhook mode
        app.post('/bot-webhook', webhookCallback(bot, 'express'));

        // Set webhook
        try {
            const webhookUrl = `${config.webhookUrl}/bot-webhook`;
            await bot.api.setWebhook(webhookUrl);
            console.log(`Webhook set to: ${webhookUrl}`);
        } catch (error) {
            console.error('Failed to set webhook:', error);
        }

        // Start Express server
        app.listen(config.port, () => {
            console.log(`Telegram bot server running on port ${config.port} (Webhook Mode)`);
        });
    }
};

startServer();

// Export for use in other modules
export { bot, supabase };
