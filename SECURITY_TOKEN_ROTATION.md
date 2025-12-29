# Security Token Rotation - URGENT

## Current Status
Your Telegram Bot Token has been publicly exposed on GitHub:
- **Exposed Token:** `8490080324:AAEoIyvYCbv09GpLdoU3GfpH7-GKmnSMU54`
- **Found In:** 
  - `.env` file (shared in repository)
  - `SYSTEM_VERIFICATION_REPORT.md` (committed to git history)
- **Risk Level:** HIGH - Token can be used to impersonate your bot

## Step 1: Create New Bot Token (Manual - via Telegram)

1. Open Telegram and search for **@BotFather**
2. Send the command `/start`
3. Send `/mybots`
4. Select **FinPro** bot (or search for your bot name)
5. Click **Edit Bot**
6. Click **Edit Commands** or scroll to find **API Token**
7. Click on the API Token line to see your current token
8. Select **Revoke current token** or **Generate new token**
9. Confirm the action (this will immediately invalidate the old token)
10. Copy the new token provided by BotFather

**⚠️ IMPORTANT:** The old token becomes completely useless after this step.

## Step 2: Update Local Environment

Once you have the new token from BotFather:

```bash
# Edit your .env file and replace:
# OLD: TELEGRAM_BOT_TOKEN=8490080324:AAEoIyvYCbv09GpLdoU3GfpH7-GKmnSMU54
# NEW: TELEGRAM_BOT_TOKEN=<YOUR_NEW_TOKEN_HERE>

nano /home/c0bw3b/FinPro/.env
# Or use your preferred editor to update TELEGRAM_BOT_TOKEN value
```

## Step 3: Remove Token from Git History

The exposed token is in the commit history. We need to remove it:

```bash
cd /home/c0bw3b/FinPro

# Option A: Remove from most recent commit only (if not pushed)
git reset HEAD~1
git add .env
git commit -m "chore: update telegram bot token"

# Option B: Remove from all history (if already pushed)
# Using BFG Repo-Cleaner:
brew install bfg  # or your package manager
bfg --replace-text TOKENS.txt repo.git
# Then: git reflog expire --expire=now --all && git gc --prune=now --aggressive

# OR manual approach:
git filter-branch --tree-filter 'sed -i "s/8490080324:AAEoIyvYCbv09GpLdoU3GfpH7-GKmnSMU54/REDACTED/g" .env' HEAD
```

## Step 4: Update Documentation

Remove the exposed token from documentation files:

- [ ] Remove token from `SYSTEM_VERIFICATION_REPORT.md`
- [ ] Remove token from any comments in code files
- [ ] Check git history for any mentions

## Step 5: Update Deployment Secrets

Update environment variables in deployed environments:

### Vercel
```bash
vercel env rm TELEGRAM_BOT_TOKEN
vercel env add TELEGRAM_BOT_TOKEN <YOUR_NEW_TOKEN>
```

### Local/PM2
```bash
# Kill the current bot
pm2 delete finpro-bot
pm2 save

# Update .env with new token
# Then restart
pm2 start "npm run bot:start" --name "finpro-bot"
pm2 save
```

## Step 6: Verify New Token Works

```bash
# Test the new token
curl "https://api.telegram.org/bot<YOUR_NEW_TOKEN>/getMe"

# Should return: {"ok":true,"result":{"id":...,"is_bot":true,...}}
```

## Step 7: Force Push to GitHub (if needed)

```bash
# If you've modified git history, force push:
git push --force-with-lease origin main

# ⚠️ Only do this if you're confident about the changes and no one else has pushed
```

## Verification Checklist

- [ ] New token created in BotFather
- [ ] Old token is revoked/invalidated
- [ ] `.env` file updated with new token
- [ ] Documentation files cleaned
- [ ] Vercel secrets updated
- [ ] Local bot restarted with new token
- [ ] Bot responds to `/start` command in Telegram
- [ ] Git history cleaned (if pushed)

## Timeline

- **NOW:** Get new token from BotFather (5 minutes)
- **NOW:** Update local `.env` and restart bot (2 minutes)
- **ASAP:** Update Vercel secrets (1 minute)
- **ASAP:** Update documentation and commit (5 minutes)
- **IF PUSHED:** Clean git history (10-15 minutes)

## Questions?

If the old token was already used by attackers:
- Monitor your bot for unusual activity
- Check Telegram Bot API logs
- Consider changing webhook URL as well
- Review all bot messages/commands sent

---

**Generated:** 2025-12-29
**Status:** URGENT - Token compromised, rotation required
