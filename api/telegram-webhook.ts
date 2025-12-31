import type { Request, Response } from 'express';
import { Bot, webhookCallback } from 'grammy';

// Initialize bot
const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN || '');

// Simple inline handlers only
bot.command('ping', async (ctx) => {
    await ctx.reply('pong');
});

bot.command('start', async (ctx) => {
    const firstName = ctx.from?.first_name || 'User';
    await ctx.reply(`Hello ${firstName}! Bot is working with inline handlers.`);
});

bot.command('help', async (ctx) => {
    await ctx.reply('Available commands: /start, /ping, /help');
});

const botCallback = webhookCallback(bot, 'express');

export default async function handler(req: Request, res: Response) {
    console.log('Function started successfully');
    
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

        // Test basic response
        return res.status(200).json({ status: 'ok', message: 'Webhook received' });
    } catch (error) {
        console.error('Webhook error:', error);
        console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
        if (!res.headersSent) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}
