import { Api } from 'grammy';
import { SupabaseClient } from '@supabase/supabase-js';

export async function handleSupabaseWebhook(
    botApi: Api,
    supabase: SupabaseClient,
    payload: any
) {
    const { table, type, record, old_record } = payload;
    const miniAppUrl = process.env.TELEGRAM_MINI_APP_URL || '';

    console.log(`Processing Supabase Webhook: ${table} ${type}`);

    try {
        if (table === 'projects' && type === 'INSERT') {
            const { data: telegramUser } = await supabase
                .from('telegram_users')
                .select('telegram_id')
                .eq('user_id', record.owner_id)
                .single();

            if (telegramUser) {
                const message = `*Project Created!*\n\n*Name:* ${record.name}\n*Capital Reserve:* $${record.total_funds.toLocaleString()}\n\nManage your project in the Mini App!`;
                await botApi.sendMessage(telegramUser.telegram_id, message, {
                    parse_mode: 'Markdown',
                    reply_markup: {
                        inline_keyboard: [[{
                            text: 'Open Project',
                            web_app: { url: `${miniAppUrl}/projects/${record.id}` }
                        }]]
                    }
                });
            }
        }

        if (table === 'subtasks') {
            if (type === 'INSERT' || (type === 'UPDATE' && record.assigned_to !== old_record?.assigned_to)) {
                if (record.assigned_to) {
                    const { data: telegramUser } = await supabase
                        .from('telegram_users')
                        .select('telegram_id')
                        .eq('user_id', record.assigned_to)
                        .single();

                    if (telegramUser) {
                        const message = `*New Task Assigned!*\n\n*Task:* ${record.title}\n*Allocation:* $${record.allocated_amount.toLocaleString()}\n\nCheck your tasks in the Mini App!`;
                        await botApi.sendMessage(telegramUser.telegram_id, message, {
                            parse_mode: 'Markdown',
                            reply_markup: {
                                inline_keyboard: [[{
                                    text: 'Open Task',
                                    web_app: { url: `${miniAppUrl}/tasks/${record.id}` }
                                }]]
                            }
                        });
                    }
                }
            } else if (type === 'UPDATE' && record.status !== old_record?.status) {
                const { data: project } = await supabase
                    .from('projects')
                    .select('owner_id, name')
                    .eq('id', record.project_id)
                    .single();

                if (project) {
                    const { data: telegramUser } = await supabase
                        .from('telegram_users')
                        .select('telegram_id')
                        .eq('user_id', project.owner_id)
                        .single();

                    if (telegramUser) {
                        const message = `*Task Status Updated*\n\n*Project:* ${project.name}\n*Task:* ${record.title}\n*New Status:* ${record.status.toUpperCase()}\n\nView details in the Mini App.`;
                        await botApi.sendMessage(telegramUser.telegram_id, message, {
                            parse_mode: 'Markdown'
                        });
                    }
                }
            }
        }
    } catch (err) {
        console.error('Error in shared handleSupabaseWebhook:', err);
    }
}
