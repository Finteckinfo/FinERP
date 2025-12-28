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

    console.log('handleStart debugging:', {
        chatId,
        telegramId,
        miniAppUrl: config.miniAppUrl
    });

    const username = message.from?.username || '';
    const firstName = message.from?.first_name || '';
    const lastName = message.from?.last_name || '';

    if (!telegramId) {
        await bot.sendMessage(chatId, 'Unable to identify your Telegram account.');
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
                `Your Telegram account will be automatically linked.\n\n` +
                `If the button above doesn't work, try this link:\n` +
                `${config.miniAppUrl}`,
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
        await bot.sendMessage(chatId, 'An error occurred. Please try again later.');
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
        await bot.sendMessage(chatId, 'Unable to identify your Telegram account.');
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
                'Your account is not linked yet. Please use /start to get started.'
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
/tasks - View your assigned tasks
/profile - Your account information
/stats - Platform statistics
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

/**
 * Handle /tasks command
 * Shows tasks assigned to the user
 */
export async function handleTasks(
    bot: TelegramBot,
    message: TelegramBot.Message,
    supabase: SupabaseClient
) {
    const chatId = message.chat.id;
    const telegramId = message.from?.id;

    if (!telegramId) return;

    try {
        const { data: telegramUser } = await supabase
            .from('telegram_users')
            .select('user_id')
            .eq('telegram_id', telegramId)
            .single();

        if (!telegramUser) {
            await bot.sendMessage(chatId, 'Account not linked. Use /start first.');
            return;
        }

        const { data: tasks } = await supabase
            .from('subtasks')
            .select('title, status, allocated_amount, projects(name)')
            .eq('assigned_to', telegramUser.user_id)
            .order('created_at', { ascending: false })
            .limit(10);

        if (!tasks || tasks.length === 0) {
            await bot.sendMessage(chatId, 'No tasks assigned to you.');
            return;
        }

        let response = '*Your Recent Tasks:*\n\n';
        tasks.forEach((task: any) => {
            const project = Array.isArray(task.projects) ? task.projects[0] : task.projects;
            response += `*${task.title}*\n`;
            response += `Project: ${project?.name || 'Unknown'}\n`;
            response += `Status: ${task.status}\n`;
            response += `Reward: $${task.allocated_amount}\n\n`;
        });

        await bot.sendMessage(chatId, response, { parse_mode: 'Markdown' });
    } catch (error) {
        console.error('Error in /tasks:', error);
        await bot.sendMessage(chatId, 'Error fetching tasks.');
    }
}

/**
 * Handle /profile command
 * Shows user profile and wallet
 */
export async function handleProfile(
    bot: TelegramBot,
    message: TelegramBot.Message,
    supabase: SupabaseClient
) {
    const chatId = message.chat.id;
    const telegramId = message.from?.id;

    if (!telegramId) return;

    try {
        const { data: user } = await supabase
            .from('telegram_users')
            .select('role, user_id, telegram_username')
            .eq('telegram_id', telegramId)
            .single();

        if (!user) {
            await bot.sendMessage(chatId, 'Profile not found. Use /start.');
            return;
        }

        const response = `
*Your Profile*

Telegram ID: \`${telegramId}\`
Wallet: \`${user.user_id}\`
Role: ${user.role}
Username: @${user.telegram_username || 'None'}
        `;

        await bot.sendMessage(chatId, response, { parse_mode: 'Markdown' });
    } catch (error) {
        console.error('Error in /profile:', error);
    }
}

/**
 * Handle /stats command
 * Shows platform statistics
 */
export async function handleStats(
    bot: TelegramBot,
    message: TelegramBot.Message,
    supabase: SupabaseClient
) {
    const chatId = message.chat.id;

    try {
        const { count: projectCount } = await supabase
            .from('projects')
            .select('*', { count: 'exact', head: true });

        const { count: taskCount } = await supabase
            .from('subtasks')
            .select('*', { count: 'exact', head: true });

        const { data: funds } = await supabase
            .from('projects')
            .select('total_funds');

        const totalValue = funds?.reduce((acc, p) => acc + p.total_funds, 0) || 0;

        const response = `
*FinPro Platform Stats*

Total Projects: ${projectCount || 0}
Total Tasks: ${taskCount || 0}
Total Locked Value: $${totalValue.toLocaleString()}
        `;

        await bot.sendMessage(chatId, response, { parse_mode: 'Markdown' });
    } catch (error) {
        console.error('Error in /stats:', error);
    }
}
/**
 * Handle /ping command
 */
export async function handlePing(bot: TelegramBot, message: TelegramBot.Message) {
    try {
        await registerCommands(bot);
        await bot.sendMessage(message.chat.id, 'Pong! Bot is active and commands have been re-registered.');
    } catch (e) {
        await bot.sendMessage(message.chat.id, 'Pong! Bot is active (Command registration failed).');
    }
}

/**
 * Register bot commands with Telegram
 */
export async function registerCommands(bot: TelegramBot) {
    const commands = [
        { command: 'start', description: 'Initialize and link account' },
        { command: 'projects', description: 'View your projects' },
        { command: 'tasks', description: 'View your assigned tasks' },
        { command: 'profile', description: 'View your profile' },
        { command: 'stats', description: 'Platform statistics' },
        { command: 'help', description: 'Show help message' },
        { command: 'ping', description: 'Check bot status' }
    ];

    try {
        // Set commands for private chats specifically to force update
        await bot.setMyCommands(commands, { scope: { type: 'all_private_chats' } });
        console.log('Bot commands registered successfully for private chats');
    } catch (error) {
        console.error('Failed to register bot commands:', error);
    }
}
