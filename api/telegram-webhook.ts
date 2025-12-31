import type { Request, Response } from 'express';
import { Bot, webhookCallback } from 'grammy';
import { createClient } from '@supabase/supabase-js';
import {
    handleStart,
    handleProjects,
    handleHelp,
    handleTasks,
    handleProfile,
    handleStats,
    handlePing,
    handleBalance,
    handleBroadcast
} from '../telegram-bot/handlers/commands.js';
import { handleSupabaseWebhook as sharedHandleSupabaseWebhook } from '../telegram-bot/handlers/webhooks.js';

// Initialize bot
const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN || '');

// Initialize Supabase
const supabase = createClient(
    process.env.VITE_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_KEY || ''
);

// Setup bot handlers
bot.command('start', (ctx) => handleStart(ctx, supabase));
bot.command('projects', (ctx) => handleProjects(ctx, supabase));
bot.command('tasks', (ctx) => handleTasks(ctx, supabase));
bot.command('profile', (ctx) => handleProfile(ctx, supabase));
bot.command('balance', (ctx) => handleBalance(ctx, supabase));
bot.command('broadcast', (ctx) => handleBroadcast(ctx, supabase));
bot.command('stats', (ctx) => handleStats(ctx, supabase));
bot.command('ping', (ctx) => handlePing(ctx));
bot.command('help', (ctx) => handleHelp(ctx));

const botCallback = webhookCallback(bot, 'express');

export default async function handler(req: Request, res: Response) {
    console.log('Webhook called:', {
        method: req.method,
        url: req.url,
        headers: req.headers,
        body: req.body
    });

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const payload = req.body;

    try {
        // 1. Detect if this is a Supabase Webhook
        if (payload.record && payload.table && payload.type) {
            console.log('Supabase Webhook detected:', payload.table, payload.type);
            await sharedHandleSupabaseWebhook(bot.api, supabase, payload);
            return res.status(200).json({ ok: true });
        }

        // 2. Handle Telegram Bot Updates using grammy's webhookCallback
        return await botCallback(req, res);
    } catch (error) {
        console.error('Webhook error:', error);
        console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
        if (!res.headersSent) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}
