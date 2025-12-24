# FinPro

FinPro is a decentralized project management platform that integrates blockchain technology for secure funding and task tracking. It features a React-based web application and a companion Telegram bot for managing projects on the go.

## Features

### Web Application
- **Wallet Authentication**: Secure login using EVM-compatible wallets.
- **Project Management**: Create and manage projects with funding goals and timelines.
- **Subtask Tracking**: Break down projects into actionable subtasks with status tracking.
- **Data Isolation**: Users can only view and manage their own projects.
- **Supabase Integration**: Real-time database updates and secure user mapping.

### Telegram Bot
- **Project Awareness**: View your active projects directly from Telegram.
- **User Linking**: Securely link your Telegram account to your blockchain wallet via the Mini App.
- **Commands**:
    - `/start`: Initialize the bot and view welcome instructions.
    - `/projects`: List all projects associated with your linked wallet.
    - `/help`: detailed usage instructions.

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- Vercel CLI (for deployment)
- Supabase Project

### Installation
1.  Clone the repository:
    ```bash
    git clone https://github.com/Finteckinfo/FinPro.git
    cd FinPro
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Configure Environment Variables:
    Create a `.env` file based on `.env.example` and add your credentials:
    ```env
    VITE_SUPABASE_URL=your_supabase_url
    SUPABASE_SERVICE_KEY=your_supabase_anon_key
    TELEGRAM_BOT_TOKEN=your_bot_token
    TELEGRAM_WEBHOOK_URL=your_vercel_url
    ```

### Running Locally
To start the development server:
```bash
npm run dev
```

### Deployment
This project is configured for deployment on Vercel.
1.  Push to GitHub.
2.  Import the project in Vercel.
3.  Configure Environment Variables in Vercel Settings.
4.  Deploy.

## Telegram Bot Setup
For detailed instructions on configuring the Telegram Bot and Webhook, please refer to the [Telegram Setup Guide](TELEGRAM_SETUP_GUIDE.md).

## License
Private Property of FinPro.
