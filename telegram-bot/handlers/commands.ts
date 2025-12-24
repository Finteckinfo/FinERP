import TelegramBot from 'node-telegram-bot-api';
import { SupabaseClient } from '@supabase/supabase-js';
import { config } from '../config.js';

/**
 * Handle /start command
 * Links Telegram user to the platform
 */
export async function handleStart(
    bot: TelegramBot,
    message: TelegramBot.Message,
    supabase: SupabaseClient
) {
    const chatId = message.chat.id;
    const telegramId = message.from?.id;
    const username = message.from?.username || '';
    const firstName = message.from?.first_name || '';
    const lastName = message.from?.last_name || '';

    if (!telegramId) {
        await bot.sendMessage(chatId, '❌ Unable to identify your Telegram account.');
        return;
    }

    try {
        // Check if user already exists in telegram_users table
        const { data: existingUser } = await supabase
            .from('telegram_users')
            .select('*')
            .eq('telegram_id', telegramId)
            .single();

        if (existingUser) {
            // User already registered
            await bot.sendMessage(
                chatId,
                `Welcome back, ${firstName}!\n\n` +
                `Your account is already linked.\n` +
                `Role: ${existingUser.role}\n\n` +
                `Use /projects to view your projects or tap the button below to open the app.`,
                {
                    reply_markup: {
                        inline_keyboard: [
                            [
                                {
                                    text: 'Open FinPro App',
                                    web_app: { url: config.miniAppUrl }
                                }
                            ]
                        ]
                    }
                }
            );
        } else {
            // New user - need to link wallet
            await bot.sendMessage(
                chatId,
                `Welcome to FinPro, ${firstName}!\n\n` +
                `To get started, please open the app and connect your wallet.\n` +
                `Your Telegram account will be automatically linked.`,
                {
                    reply_markup: {
                        inline_keyboard: [
                            [
                                {
                                    text: 'Open FinPro App',
                                    web_app: { url: config.miniAppUrl }
                                }
                            ]
                        ]
                    }
                }
            );
        }
    } catch (error) {
        console.error('Error in /start handler:', error);
        await bot.sendMessage(chatId, '❌ An error occurred. Please try again later.');
    }
}

/**
 * Handle /projects command
 * Shows user's projects based on their role
 */
export async function handleProjects(
    bot: TelegramBot,
    message: TelegramBot.Message,
    supabase: SupabaseClient
) {
    const chatId = message.chat.id;
    const telegramId = message.from?.id;

    if (!telegramId) {
        await bot.sendMessage(chatId, '❌ Unable to identify your Telegram account.');
        return;
    }

    try {
        // Get user from telegram_users
        const { data: telegramUser } = await supabase
            .from('telegram_users')
            .select('user_id, role')
            .eq('telegram_id', telegramId)
            .single();

        if (!telegramUser) {
            await bot.sendMessage(
                chatId,
                '❌ Your account is not linked yet. Please use /start to get started.'
            );
            return;
        }

        let projects;
        if (telegramUser.role === 'admin') {
            // Admin sees all projects
            const { data } = await supabase
                .from('projects')
                .select('id, name, status, total_funds')
                .order('created_at', { ascending: false })
                .limit(10);
            projects = data;
        } else {
            // Assignee sees only their assigned projects
            const { data } = await supabase
                .from('subtasks')
                .select('project_id, projects(id, name, status, total_funds)')
                .eq('assigned_to', telegramUser.user_id)
                .limit(10);


            // Extract unique projects
            const projectsMap = new Map();
            data?.forEach(item => {
                if (item.projects && Array.isArray(item.projects) && item.projects.length > 0) {
                    const project = item.projects[0];
                    projectsMap.set(project.id, project);
                }
            });
            projects = Array.from(projectsMap.values());
        }

        if (!projects || projects.length === 0) {
            await bot.sendMessage(chatId, 'You have no projects yet.');
            return;
        }

        let response = `Your Projects (${telegramUser.role}):\n\n`;
        projects.forEach((project: any, index: number) => {
            response += `${index + 1}. ${project.name}\n`;
            response += `   Status: ${project.status}\n`;
            response += `   Funds: $${project.total_funds.toLocaleString()}\n\n`;
        });

        await bot.sendMessage(chatId, response, {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: 'Open Full App',
                            web_app: { url: config.miniAppUrl }
                        }
                    ]
                ]
            }
        });
    } catch (error) {
        console.error('Error in /projects handler:', error);
        await bot.sendMessage(chatId, 'An error occurred while fetching projects.');
    }
}

/**
 * Handle /help command
 */
export async function handleHelp(bot: TelegramBot, message: TelegramBot.Message) {
    const chatId = message.chat.id;

    const helpText = `
*FinPro Bot Commands*

/start - Link your Telegram account
/projects - View your projects
/help - Show this help message

*Quick Actions*
Tap the button below to open the full FinPro app within Telegram!
  `;

    await bot.sendMessage(chatId, helpText, {
        parse_mode: 'Markdown',
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: 'Open FinPro App',
                        web_app: { url: config.miniAppUrl }
                    }
                ]
            ]
        }
    });
}
