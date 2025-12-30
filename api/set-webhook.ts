import type { Request, Response } from 'express';
import { Bot } from 'grammy';

export default async function handler(req: Request, res: Response) {
    const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN || '');

    try {
        const webhookUrl = `${process.env.TELEGRAM_WEBHOOK_URL}/webhook`;
        // Note: The vercel.json rewrites /webhook to /api/telegram-webhook

        await bot.api.setWebhook(webhookUrl);
        const webhookInfo = await bot.api.getWebhookInfo();

        res.status(200).json({
            success: true,
            message: 'Webhook set successfully',
            webhookInfo
        });
    } catch (error: any) {
        console.error('Error setting webhook:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Unknown error'
        });
    }
}
