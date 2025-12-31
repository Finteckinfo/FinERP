import type { Request, Response } from 'express';
import { Bot, webhookCallback } from 'grammy';
import { createClient } from '@supabase/supabase-js';

// Initialize bot
const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN || '');

// Initialize Supabase
const supabase = createClient(
    process.env.VITE_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_KEY || ''
);

// Simple health check handler
bot.command('ping', async (ctx) => {
    await ctx.reply('pong');
});

bot.command('start', async (ctx) => {
    const firstName = ctx.from?.first_name || 'User';
    await ctx.reply(`Hello ${firstName}! Bot is working.`);
});

const botCallback = webhookCallback(bot, 'express');

export default async function handler(req: Request, res: Response) {
    console.log('Webhook called:', {
        method: req.method,
        url: req.url,
        body: req.body
    });

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Handle Telegram Bot Updates using grammy's webhookCallback
        return await botCallback(req, res);
    } catch (error) {
        console.error('Webhook error:', error);
        console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
        if (!res.headersSent) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}
