import type { Request, Response } from 'express';

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

        const update = req.body;
        console.log('Received update:', update);

        // Test basic response without any bot processing
        return res.status(200).json({ status: 'ok', message: 'Update received' });
    } catch (error) {
        console.error('Webhook error:', error);
        console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
        if (!res.headersSent) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}
