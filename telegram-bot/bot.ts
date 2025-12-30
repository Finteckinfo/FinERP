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

// Telegram Bot Webhook endpoint
app.post('/bot-webhook', webhookCallback(bot, 'express'));

// Health check endpoint
app.get('/health', (req: express.Request, res: express.Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(config.port, async () => {
    console.log(`Telegram bot server running on port ${config.port}`);

    // Register commands with Telegram
    await registerCommands(bot.api);

    // Set webhook
    try {
        const webhookUrl = `${config.webhookUrl}/bot-webhook`;
        await bot.api.setWebhook(webhookUrl);
        console.log(`Webhook set to: ${webhookUrl}`);
    } catch (error) {
        console.error('Failed to set webhook:', error);
    }
});

// Export for use in other modules
export { bot, supabase };
