import 'dotenv/config';
import { Bot } from 'grammy';
import { config } from '../config.js';

async function checkStatus() {
    console.log('--- FinPro Bot Diagnostic ---');
    console.log('Time:', new Date().toISOString());

    // 1. Check Bot Token
    if (!process.env.TELEGRAM_BOT_TOKEN) {
        console.error('❌ TELEGRAM_BOT_TOKEN is missing!');
    } else {
        console.log('✅ TELEGRAM_BOT_TOKEN is present');
        const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN);
        try {
            const me = await bot.api.getMe();
            console.log(`✅ Bot Authenticated: @${me.username} (${me.id})`);
        } catch (e: any) {
            console.error(`❌ Bot Authentication Failed: ${e.message}`);
        }
    }

    // 2. Check Webhook/Polling Status
    console.log('\n--- Operation Mode Check ---');
    const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN || '');
    try {
        const webhookInfo = await bot.api.getWebhookInfo();
        console.log('Telegram API reports Webhook URL:', webhookInfo.url || '(None - Polling Mode)');

        const configuredPolling = process.env.TELEGRAM_USE_POLLING === 'true';
        console.log('Environment TELEGRAM_USE_POLLING:', configuredPolling);

        if (configuredPolling) {
            if (webhookInfo.url) {
                console.warn('⚠️ MISMATCH: Polling is enabled in env, but Webhook is still set on Telegram!');
                console.warn('   The bot should invoke deleteWebhook() on startup. Try restarting the bot.');
            } else {
                console.log('✅ Configuration MATCH: Polling verified (Webhook is unset).');
            }
        } else {
            if (!webhookInfo.url) {
                console.warn('⚠️ MISMATCH: Webhook mode expected, but no Webhook URL set on Telegram!');
            } else {
                console.log('✅ Configuration MATCH: Webhook verified.');
            }
        }

    } catch (e: any) {
        console.error(`❌ Failed to get Webhook Info: ${e.message}`);
    }

    // 3. Check App URL
    console.log('\n--- App Configuration ---');
    console.log(`Mini App URL: ${config.miniAppUrl}`);
    console.log(`Webhook URL: ${config.webhookUrl}`);
    console.log(`Port: ${config.port}`);

    // 4. Check Supabase
    console.log('\n--- Supabase Status ---');
    if (!process.env.VITE_SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
        console.error('❌ Supabase credentials missing!');
    } else {
        console.log('✅ Supabase credentials present');
    }

    console.log('\n--- Diagnostic Complete ---');
}

checkStatus();
