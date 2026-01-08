# Security & Anti-Duplication Guide

To protect the intellectual property of **FinPro** against unauthorized duplication and leakages, especially now that the code resides in a client-controlled environment, you MUST adhere to the following security protocols.

## 1. Repository Privacy (CRITICAL)

**Verification:**
1. Go to the GitHub repository page.
2. Check the top right corner (next to the repo name). It MUST say **Private**.
3. If it says **Public**, immediately go to:
   - `Settings` > `General` > `Danger Zone` > `Change repository visibility`.
   - Select **Make private**.

**Why?** Public repos can be cloned by anyone on the internet. Private repos are only accessible to authorized team members.

## 2. Access Control

**Limit Collaborators:**
- Only add people who *absolutely* need access.
- Go to `Settings` > `Collaborators`.
- Audit the list. Remove anyone who no longer needs access immediately.

## 3. Branch Protection

Prevent accidental deletion or unauthorized overwrites of the main code.

1. Go to `Settings` > `Branches`.
2. Click **Add branch protection rule**.
3. Branch name pattern: `main` (or `master`).
4. Check:
   - `Require a pull request before merging`.
   - `Require approvals` (Set to 1 or 2).
   - `Lock branch` (Optional: Use this if you want to freeze the code completely until payment).

## 4. Secret Management

**Never commit secrets to code.** 
Your `.env` file contains keys (API keys, Private Keys).
- Ensure `.gitignore` always contains `.env`.
- Do NOT upload `.env` files to GitHub manually.
- If a secret is leaked, rotate it immediately (e.g., Generate a new Telegram Bot Token).

## 5. Deployment Protection

If you are deploying to Vercel/Netlify:
- Ensure the connected GitHub account has strictly limited permissions.
- Use Environment Variables in the hosting dashboard, not in the code.

---
**Disclaimer:** These technical measures support the legal protection provided by the LICENSE. Technical barriers are the first line of defense against straightforward duplication.
