# Telegram dApp Setup Guide

This guide will help you set up the Telegram Mini App integration for FinPro.

## Prerequisites

- Node.js 18+ installed
- Telegram account
- Supabase project set up
- Deployed web application (for Mini App URL)

## Step 1: Create Telegram Bot

1. Open Telegram and search for @BotFather
2. Send `/newbot` command
3. Follow the prompts to:
   - Choose a name for your bot (e.g., "FinPro Bot")
   - Choose a username (must end in 'bot', e.g., "finpro_app_bot")
4. **Save the bot token** - you'll need this later
5. Configure your bot:
   ```
   /setdescription
   ```
   Then paste this description:
   ```
   FinPro - Decentralized Project Management Platform
   
   Manage projects, assign tasks, and track progress with blockchain-powered escrow and token rewards. Admins can create projects and assign work, while team members can view their tasks and submit deliverables.
   ```
   
   ```
   /setabouttext
   ```
   Then paste this about text:
   ```
   FinPro is a decentralized project management platform that combines traditional project management with blockchain technology for transparent fund allocation and task tracking.
   ```
   
   ```
   /setuserpic
   ```
   Upload your bot profile picture (512x512px recommended)

## Step 2: Set Up Mini App

1. Send `/newapp` command to BotFather
2. Select your bot
3. Provide:
   - Title: "FinPro"
   - Description: "Decentralized Project Management Platform"
   - Photo: Upload your app icon (640x360px recommended)
   - Demo GIF (optional)
   - **Web App URL**: Your deployed app URL (e.g., https://fin1pro.vercel.app)

## Step 3: Configure Environment Variables

Create a `.env` file in the project root with the following variables:

```bash
# Existing Supabase variables
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# New Telegram Bot variables
TELEGRAM_BOT_TOKEN=your_bot_token_from_step_1
TELEGRAM_WEBHOOK_URL=https://your-backend-domain.com
TELEGRAM_MINI_APP_URL=https://your-mini-app-url.com
BOT_PORT=3001

# Supabase Service Key (for bot backend)
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
```

**Important**: The `SUPABASE_SERVICE_KEY` is different from the anon key. Find it in Supabase Dashboard -> Settings -> API -> service_role key.

## Step 4: Run Database Migration

Execute the migration to add Telegram user mapping and messaging tables:

```bash
# Connect to your Supabase database
psql -h <your-supabase-host> -U postgres -d postgres -f migrations/add_telegram_messaging.sql
```

Or run it directly in the Supabase SQL Editor:
1. Go to Supabase Dashboard -> SQL Editor
2. Copy the contents of `migrations/add_telegram_messaging.sql`
3. Paste and execute

## Step 5: Install Dependencies

```bash
npm install
```

This will install:
- `@tma.js/sdk` - Telegram Mini Apps SDK
- `node-telegram-bot-api` - Telegram Bot API client
- `express` - Bot webhook server
- `tsx` - TypeScript execution
- Type definitions for all above

## Step 6: Deploy Bot Server

The bot server needs to be deployed separately from your frontend. Options:

### Option A: Deploy to Vercel (Serverless)

1. Create `api/telegram-webhook.ts`:
```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';
// Import your bot handler logic
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle webhook
}
```

2. Deploy to Vercel

### Option B: Deploy to Railway/Render (Long-running)

1. Create `Procfile`:
```
web: npm run bot:start
```

2. Deploy to Railway or Render
3. Set environment variables in the platform dashboard

### Option C: Run Locally (Development)

```bash
# Install ngrok for local webhook testing
npm install -g ngrok

# Start ngrok tunnel
ngrok http 3001

# Copy the HTTPS URL and set it as TELEGRAM_WEBHOOK_URL in .env

# Start bot server
npm run bot:dev
```

## Step 7: Set Webhook

Once your bot server is deployed, set the webhook URL:

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-bot-server.com/webhook"}'
```

Or the bot will automatically set it when it starts (see `telegram-bot/bot.ts`).

## Step 8: Create Admin User

To designate yourself as an admin:

1. Start a chat with your bot in Telegram
2. Send `/start` command
3. Note your Telegram ID from the bot's response (or check bot logs)
4. Insert into database:

```sql
-- First, ensure you have a user record
INSERT INTO users (id, email, full_name)
VALUES ('your_wallet_address', 'your@email.com', 'Your Name')
ON CONFLICT (id) DO NOTHING;

-- Then link your Telegram account as admin
INSERT INTO telegram_users (telegram_id, telegram_username, user_id, role)
VALUES (
  123456789,  -- Your Telegram ID
  'your_telegram_username',
  'your_wallet_address',
  'admin'
);
```

## Step 9: Test the Integration

1. Open Telegram and find your bot
2. Send `/start`. It should reply with a welcome message.
3. Click "Open FinPro App" - the Mini App should load within Telegram
4. Connect your wallet - your Telegram account will be linked
5. Create a project - other admins should receive a notification
6. Assign a subtask - the assignee should receive a notification

## Troubleshooting

### Bot not responding
- Check that webhook is set correctly: `https://api.telegram.org/bot<TOKEN>/getWebhookInfo`
- Verify bot server is running and accessible
- Check bot server logs for errors

### Mini App not loading
- Verify `TELEGRAM_MINI_APP_URL` is correct
- Ensure the URL is HTTPS
- Check that the deployed app includes TMA SDK integration

### Notifications not working
- Verify `SUPABASE_SERVICE_KEY` is set correctly
- Check that users have records in `telegram_users` table
- Review bot server logs for notification errors

### Database errors
- Ensure migration was run successfully
- Verify RLS policies are set correctly
- Check that service key has necessary permissions

## Next Steps

After basic setup:

1. **Customize Bot Commands**: Edit `telegram-bot/handlers/commands.ts`
2. **Add More Notifications**: Extend `telegram-bot/notifications.ts`
3. **Implement Messaging UI**: Create messaging components in the React app
4. **Add Role Management**: Create admin panel for managing user roles
5. **Deploy DEX Enhancements**: Implement fee system and meta-transactions

## Security Checklist

- [ ] Bot token stored securely (never in client-side code)
- [ ] Service key not exposed in frontend
- [ ] Webhook URL uses HTTPS
- [ ] RLS policies properly configured
- [ ] Input validation on all bot commands
- [ ] Rate limiting on webhook endpoint
- [ ] Telegram WebApp data validation (hash verification)

## Resources

- [Telegram Bot API Documentation](https://core.telegram.org/bots/api)
- [Telegram Mini Apps Documentation](https://core.telegram.org/bots/webapps)
- [TMA.js SDK Documentation](https://docs.telegram-mini-apps.com/)
- [Supabase Documentation](https://supabase.com/docs)
