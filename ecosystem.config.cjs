module.exports = {
    apps: [
        {
            name: 'finpro-bot',
            script: 'node',
            args: '--import tsx --no-warnings telegram-bot/bot.ts',
            cwd: './',
            env: {
                NODE_ENV: 'production',
                PORT: 3001
            },
            watch: false,
            max_memory_restart: '500M',
            error_file: './logs/bot-error.log',
            out_file: './logs/bot-out.log',
            log_date_format: 'YYYY-MM-DD HH:mm:ss',
            autorestart: true,
            restart_delay: 4000
        }
    ]
};
