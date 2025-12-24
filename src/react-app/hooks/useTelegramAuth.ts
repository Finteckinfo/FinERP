import { useEffect, useState } from 'react';
import WebApp from '@twa-dev/sdk';

// Extend Window interface for Telegram WebApp
declare global {
    interface Window {
        Telegram?: {
            WebApp: any;
        };
    }
}

export interface TelegramUser {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
    is_premium?: boolean;
}

export interface TelegramAuthData {
    user: TelegramUser | null;
    isReady: boolean;
    isTelegramEnv: boolean;
}

/**
 * Hook to authenticate and get Telegram user data
 * Works both in Telegram Mini App and regular web browser
 */
export function useTelegramAuth(): TelegramAuthData {
    const [authData, setAuthData] = useState<TelegramAuthData>({
        user: null,
        isReady: false,
        isTelegramEnv: false,
    });

    useEffect(() => {
        // Check if running in Telegram environment
        const isTelegram = typeof window !== 'undefined' && window.Telegram?.WebApp;

        if (isTelegram) {
            try {
                // Initialize Telegram WebApp
                WebApp.ready();

                // Get user data from Telegram
                const tgUser = WebApp.initDataUnsafe?.user;

                if (tgUser) {
                    setAuthData({
                        user: {
                            id: tgUser.id,
                            first_name: tgUser.first_name,
                            last_name: tgUser.last_name,
                            username: tgUser.username,
                            language_code: tgUser.language_code,
                            is_premium: tgUser.is_premium,
                        },
                        isReady: true,
                        isTelegramEnv: true,
                    });

                    // Expand the app to full height
                    WebApp.expand();

                    // Enable closing confirmation
                    WebApp.enableClosingConfirmation();
                } else {
                    setAuthData({
                        user: null,
                        isReady: true,
                        isTelegramEnv: true,
                    });
                }
            } catch (error) {
                console.error('Error initializing Telegram WebApp:', error);
                setAuthData({
                    user: null,
                    isReady: true,
                    isTelegramEnv: false,
                });
            }
        } else {
            // Not in Telegram environment
            setAuthData({
                user: null,
                isReady: true,
                isTelegramEnv: false,
            });
        }
    }, []);

    return authData;
}

/**
 * Hook to link Telegram user with wallet address in database
 */
export function useTelegramUserSync(telegramUser: TelegramUser | null, walletAddress: string | null) {
    const [synced, setSynced] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!telegramUser || !walletAddress) return;

        const syncUser = async () => {
            try {
                const { supabase } = await import('@/react-app/lib/supabase');

                // Check if Telegram user already exists
                const { data: existing } = await supabase
                    .from('telegram_users')
                    .select('*')
                    .eq('telegram_id', telegramUser.id)
                    .single();

                if (!existing) {
                    // Create new Telegram user record
                    const { error: insertError } = await supabase
                        .from('telegram_users')
                        .insert({
                            telegram_id: telegramUser.id,
                            telegram_username: telegramUser.username,
                            telegram_first_name: telegramUser.first_name,
                            telegram_last_name: telegramUser.last_name,
                            user_id: walletAddress,
                            role: 'assignee', // Default role
                        });

                    if (insertError) throw insertError;
                } else if (existing.user_id !== walletAddress) {
                    // Update user_id if wallet changed
                    const { error: updateError } = await supabase
                        .from('telegram_users')
                        .update({ user_id: walletAddress })
                        .eq('telegram_id', telegramUser.id);

                    if (updateError) throw updateError;
                }

                setSynced(true);
            } catch (err) {
                console.error('Error syncing Telegram user:', err);
                setError(err instanceof Error ? err.message : 'Failed to sync user');
            }
        };

        syncUser();
    }, [telegramUser, walletAddress]);

    return { synced, error };
}

/**
 * Get user role from Telegram users table
 */
export async function getTelegramUserRole(telegramId: number): Promise<'admin' | 'assignee' | null> {
    try {
        const { supabase } = await import('@/react-app/lib/supabase');

        const { data, error } = await supabase
            .from('telegram_users')
            .select('role')
            .eq('telegram_id', telegramId)
            .single();

        if (error) throw error;
        return data?.role as 'admin' | 'assignee' | null;
    } catch (error) {
        console.error('Error fetching user role:', error);
        return null;
    }
}
