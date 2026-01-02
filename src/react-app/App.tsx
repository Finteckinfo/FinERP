import { BrowserRouter as Router, Routes, Route } from "react-router";
import { useEffect } from "react";
import HomePage from "@/react-app/pages/Home";
import ProjectDetailPage from "@/react-app/pages/ProjectDetail";
import LoginPage from "@/react-app/pages/Login";
import TaskRedirect from "@/react-app/pages/TaskRedirect";
import { TokenSwap } from "@/react-app/pages/TokenSwap";
import ProtectedRoute from "@/react-app/components/ProtectedRoute";
import { NetworkBanner } from "@/react-app/components/NetworkBanner";
import { MultiChainWalletProvider, useMultiChainWallet } from "@/react-app/context/MultiChainWalletContext";
import { useWallet } from "@/react-app/context/WalletContext";
import { useTelegramAuth, useTelegramUserSync } from "@/react-app/hooks/useTelegramAuth";
import { toast, Toaster } from "react-hot-toast";

// Wrapper component to handle Telegram syncing
function TelegramSyncWrapper({ children }: { children: React.ReactNode }) {
  const { user: telegramUser, isTelegramEnv } = useTelegramAuth();
  const { account: evmAddress } = useWallet();
  const { tonWallet } = useMultiChainWallet();

  // Sync both wallets if available
  const { synced, error } = useTelegramUserSync(
    telegramUser,
    evmAddress,
    tonWallet?.tonAddress || null
  );

  useEffect(() => {
    if (synced && isTelegramEnv) {
      toast.success("Telegram account linked successfully!");
    }
    if (error) {
      console.error("Telegram sync error:", error);
    }
  }, [synced, error, isTelegramEnv]);

  return <>{children}</>;
}

export default function App() {
  return (
    <Router>
      <MultiChainWalletProvider>
        <TelegramSyncWrapper>
          <Toaster position="top-center" />
          <NetworkBanner />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/projects/:id"
              element={
                <ProtectedRoute>
                  <ProjectDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tasks/:id"
              element={
                <ProtectedRoute>
                  <TaskRedirect />
                </ProtectedRoute>
              }
            />
            <Route
              path="/swap"
              element={
                <ProtectedRoute>
                  <TokenSwap />
                </ProtectedRoute>
              }
            />
          </Routes>
        </TelegramSyncWrapper>
      </MultiChainWalletProvider>
    </Router>
  );
}
