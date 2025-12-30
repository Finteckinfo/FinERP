import { Bot } from 'grammy';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.argv[2];

if (!token) {
    console.error('❌ Error: TELEGRAM_BOT_TOKEN not found in .env');
    process.exit(1);
}

if (!chatId) {
    console.error('❌ Error: Please provide the Chat ID as an argument.');
    console.log('Usage: npx tsx telegram-bot/scripts/enable-forum.ts <chat_id>');
    process.exit(1);
}

const bot = new Bot(token);

async function enableForum() {
    let targetId: string | number = chatId;

    if (!chatId.startsWith('-')) {
        console.warn('⚠️  Warning: Usually Group/Supergroup IDs start with a minus sign (e.g., -100...)');
    }

    try {
        targetId = isNaN(Number(chatId)) ? chatId : Number(chatId);

        console.log(`\n🔍 Fetching details for chat: ${targetId}...`);
        const chat = await bot.api.getChat(targetId);
        console.log('✅ Chat found!');
        console.log(`   Type: ${chat.type}`);
        console.log(`   Title: ${(chat as any).title || 'N/A'}`);

        const me = await bot.api.getMe();
        const member = await bot.api.getChatMember(targetId, me.id);

        console.log(`\n🤖 Bot Status: ${member.status}`);
        if (member.status === 'administrator') {
            console.log(`   Can Manage Topics: ${(member as any).can_manage_topics ? '✅ YES' : '❌ NO'}`);
        }

        if (chat.type !== 'supergroup') {
            console.warn('\n⚠️  Important: The group MUST be a "Supergroup" to support Forum Topics.');
            console.log('💡 Tip: Go to Group Settings -> Group Type -> Make it a "Public Group" (temporarily) or toggle "Chat History for New Members" to "Visible" to force it to a Supergroup.');
            return;
        }

        console.log(`\n🔄 Attempting to enable forum topics...`);

        const apiCall = (bot.api as any).setChatForum
            ? (bot.api as any).setChatForum(targetId)
            : (bot.api as any).raw.setChatForum({ chat_id: targetId });

        await apiCall;

        console.log('✅ Success! Forum topics have been enabled.');
        console.log(`\n👉 Your TELEGRAM_MASTER_CHAT_ID is: ${targetId}`);
    } catch (error: any) {
        console.error('\n❌ Error:');
        console.error(error.message);

        if (error.description?.includes('chat not found')) {
            console.log('\n💡 Tip: The bot MUST be added to the group first before I can help you enable topics.');
        } else if (error.description?.includes('not enough rights')) {
            console.log('\n💡 Tip: The bot must be an ADMIN with "Manage Topics" permission.');
        }
    }
}

enableForum();
