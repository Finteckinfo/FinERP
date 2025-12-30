import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { WalletProvider } from '/home/c0bw3b/FinPro/src/react-app/context/WalletContext.tsx';
import { useTelegramAuth, useTelegramUserSync, getTelegramUserRole } from '../react-app/hooks/useTelegramAuth';
import { useWallet } from '../react-app/context/WalletContext';
import AdminView from './views/AdminView';
import AssigneeView from './views/AssigneeView';
import ProjectDetail from '../react-app/pages/ProjectDetail.tsx';

/**
 * Main Telegram Mini App component
 * Determines user role and renders appropriate view
 */
function TelegramAppContent() {
    const { user, isReady, isTelegramEnv } = useTelegramAuth();
    const { address } = useWallet();
    const [userRole, setUserRole] = useState<'admin' | 'assignee' | null>(null);
    const [roleLoading, setRoleLoading] = useState(true);

    // Sync Telegram user with wallet address
    useTelegramUserSync(user, address);

    // Fetch user role
    useEffect(() => {
        if (!user) {
            setRoleLoading(false);
            return;
        }

        const fetchRole = async () => {
            const role = await getTelegramUserRole(user.id);
            setUserRole(role);
            setRoleLoading(false);
        };

        fetchRole();
    }, [user]);

    // Show loading state
    if (!isReady || roleLoading) {
        return (
            <div className="min-h-screen bg-[#050B18] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-[#0D99FF] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-blue-400 font-medium">Initializing FinPro...</p>
                </div>
            </div>
        );
    }

    // Show error if not in Telegram environment
    if (!isTelegramEnv) {
        return (
            <div className="min-h-screen bg-[#050B18] flex items-center justify-center p-4">
                <div className="bg-[#121A2C] rounded-3xl border border-white/5 p-8 max-w-md text-center">
                    <h2 className="text-2xl font-black text-white mb-4">Telegram Required</h2>
                    <p className="text-gray-400 mb-6">
                        This app is designed to run within Telegram. Please open it through the Telegram bot.
                    </p>
                    <a
                        href="https://t.me/your_bot_username"
                        className="inline-block px-6 py-3 bg-gradient-to-r from-[#0D99FF] to-[#0066FF] text-white rounded-xl font-bold hover:shadow-lg transition-all"
                    >
                        Open in Telegram
                    </a>
                </div>
            </div>
        );
    }

    // Render role-based view
    return (
        <Routes>
            <Route
                path="/"
                element={
                    userRole === 'admin' ? (
                        <AdminView />
                    ) : userRole === 'assignee' ? (
                        <AssigneeView />
                    ) : (
                        <div className="min-h-screen bg-[#050B18] flex items-center justify-center p-4">
                            <div className="bg-[#121A2C] rounded-3xl border border-white/5 p-8 max-w-md text-center">
                                <h2 className="text-2xl font-black text-white mb-4">Account Not Linked</h2>
                                <p className="text-gray-400 mb-6">
                                    Please connect your wallet to link your Telegram account.
                                </p>
                            </div>
                        </div>
                    )
                }
            />
            <Route path="/projects/:id" element={<ProjectDetail />} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

/**
 * Root Telegram App with providers
 */
export default function TelegramApp() {
    return (
        <BrowserRouter>
            <WalletProvider>
                <TelegramAppContent />
            </WalletProvider>
        </BrowserRouter>
    );
}
