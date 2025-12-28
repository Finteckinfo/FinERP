export const config = {
    // Telegram Bot Token from @BotFather
    botToken: process.env.TELEGRAM_BOT_TOKEN || '',

    // Webhook URL for receiving updates from Telegram
    webhookUrl: process.env.TELEGRAM_WEBHOOK_URL || '',

    // Mini App URL (deployed React app)
    miniAppUrl: (() => {
        let url = process.env.TELEGRAM_MINI_APP_URL || 'https://fin1pro.vercel.app';
        if (!url.startsWith('http')) {
            url = `https://${url}`;
        }
        return url;
    })(),

    // Server port
    port: parseInt(process.env.BOT_PORT || '3001', 10),

    // Supabase configuration
    supabase: {
        url: process.env.VITE_SUPABASE_URL || '',
        serviceKey: process.env.SUPABASE_SERVICE_KEY || '',
    },
};

// Validate required configuration
export function validateConfig() {
    const required = ['botToken', 'webhookUrl', 'miniAppUrl'];
    const missing = required.filter(key => !config[key as keyof typeof config]);

    if (missing.length > 0) {
        throw new Error(`Missing required configuration: ${missing.join(', ')}`);
    }
}
