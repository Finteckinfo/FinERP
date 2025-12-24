import TelegramBot from 'node-telegram-bot-api';
import { createClient } from '@supabase/supabase-js';

// Initialize bot (without polling for serverless)
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });

// Initialize Supabase
const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
    console.log('Webhook received:', JSON.stringify(req.body, null, 2));

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const update = req.body;
        console.log('Processing update:', update);

        // Handle different types of updates
        if (update.message) {
            const message = update.message;

            // Handle commands
            if (message.text && message.text.startsWith('/')) {
                const command = message.text.split(' ')[0].substring(1);
                console.log('Command received:', command);

                switch (command) {
                    case 'start':
                        await bot.sendMessage(message.chat.id, 'Welcome to FinPro.\n\nFinPro allows you to manage decentralized project funding and tracking. Use the commands below to interact with your projects:\n\n/projects - List all projects associated with your linked wallet.\n/help - View detailed command instructions.');
                        break;
                    case 'projects':
                        try {
                            // 1. Find the wallet linked to this Telegram user
                            const { data: linkedUser, error: userError } = await supabase
                                .from('telegram_users')
                                .select('user_id')
                                .eq('telegram_id', message.chat.id)
                                .single();

                            if (userError || !linkedUser) {
                                await bot.sendMessage(message.chat.id, `Account Not Linked\n\nPlease open the Mini App to link your wallet first. This connects your Telegram account to your blockchain identity:\n${process.env.VITE_MINI_APP_URL || 'https://fin1pro.vercel.app'}`);
                                break;
                            }

                            // 2. Fetch projects for this wallet
                            const { data: projects, error: projectsError } = await supabase
                                .from('projects')
                                .select('id, name, status, total_funds')
                                .eq('owner_id', linkedUser.user_id)
                                .order('created_at', { ascending: false })
                                .limit(5);

                            if (projectsError) {
                                console.error('Error fetching projects:', projectsError);
                                await bot.sendMessage(message.chat.id, 'Error fetching projects. Please try again later.');
                                break;
                            }

                            if (!projects || projects.length === 0) {
                                await bot.sendMessage(message.chat.id, 'You have no active projects associated with your wallet.');
                                break;
                            }

                            // 3. Format Response
                            let response = 'Your Recent Projects:\n\n';
                            projects.forEach(p => {
                                const statusText = p.status === 'completed' ? '[COMPLETED]' : p.status === 'active' ? '[ACTIVE]' : '[INACTIVE]';
                                response += `${statusText} ${p.name}\nFunds: $${p.total_funds}\nID: ${p.id}\n\n`;
                            });

                            await bot.sendMessage(message.chat.id, response);

                        } catch (err) {
                            console.error('Projects command error:', err);
                            await bot.sendMessage(message.chat.id, 'An unexpected error occurred processing your request.');
                        }
                        break;
                    case 'help':
                        await bot.sendMessage(message.chat.id, 'FinPro Bot Commands:\n\n/start - Initialize the bot and view the welcome message.\n/projects - Retrieve a list of projects linked to your wallet address. Requires your Telegram account to be linked via the Mini App.\n/help - Display this help message with usage instructions.');
                        break;
                    default:
                        await bot.sendMessage(message.chat.id, 'Unknown command. Use /help to see available commands.');
                }
            }
        }

        res.status(200).json({ ok: true });
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
