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
    try {
        // Simple health check
        if (req.method === 'GET') {
            return res.status(200).json({ status: 'ok', message: 'Telegram webhook is running' });
        }

        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method not allowed' });
        }

        console.log('Webhook called:', {
            method: req.method,
            url: req.url,
            body: req.body
        });

        // Return success for now
        return res.status(200).json({ status: 'ok' });
    } catch (error) {
        console.error('Webhook error:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}
