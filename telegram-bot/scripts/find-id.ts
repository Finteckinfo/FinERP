import { Bot } from 'grammy';
import * as dotenv from 'dotenv';

dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
    console.error('❌ Error: TELEGRAM_BOT_TOKEN not found in .env');
    process.exit(1);
}

const bot = new Bot(token);

console.log('📡 Listener started!');
console.log('1. Add your bot to the group (if not already there).');
console.log('2. Send ANY message in that group.');
console.log('3. Watch this terminal for the Chat ID.\n');

bot.on('message', (ctx) => {
    const chat = ctx.chat;
    const from = ctx.from;

    console.log('----------------------------------------');
    console.log(`📩 Message received!`);
    console.log(`👤 From: ${from.first_name} (@${from.username || 'n/a'})`);
    console.log(`📍 Chat Title: ${(chat as any).title || 'Private Chat'}`);
    console.log(`🆔 CHAT ID: ${chat.id}`);
    console.log(`📝 Text: ${ctx.message.text || '[not text]'}`);
    console.log('----------------------------------------');
});

bot.start();
