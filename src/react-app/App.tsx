import { BrowserRouter as Router, Routes, Route } from "react-router";
import { useEffect } from "react";
import HomePage from "@/react-app/pages/Home";
import ProjectDetailPage from "@/react-app/pages/ProjectDetail";
import LoginPage from "@/react-app/pages/Login";
import { TokenSwap } from "@/react-app/pages/TokenSwap";
import ProtectedRoute from "@/react-app/components/ProtectedRoute";
import { WalletProvider, useWallet } from "@/react-app/context/WalletContext";
import { useTelegramAuth, useTelegramUserSync } from "@/react-app/hooks/useTelegramAuth";
import { toast, Toaster } from "react-hot-toast";

// Wrapper component to handle Telegram syncing
function TelegramSyncWrapper({ children }: { children: React.ReactNode }) {
  const { user: telegramUser, isTelegramEnv } = useTelegramAuth();
  const { account } = useWallet();
  const { synced, error } = useTelegramUserSync(telegramUser, account);

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
      <WalletProvider>
        <TelegramSyncWrapper>
          <Toaster position="top-center" />
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
              path="/swap"
              element={
                <ProtectedRoute>
                  <TokenSwap />
                </ProtectedRoute>
              }
            />
          </Routes>
        </TelegramSyncWrapper>
      </WalletProvider>
    </Router>
  );
}
