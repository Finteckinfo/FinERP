import { BrowserRouter as Router, Routes, Route } from "react-router";
import HomePage from "@/react-app/pages/Home";
import ProjectDetailPage from "@/react-app/pages/ProjectDetail";
import LoginPage from "@/react-app/pages/Login";
import TaskRedirect from "@/react-app/pages/TaskRedirect";
import { TokenSwap } from "@/react-app/pages/TokenSwap";
import ProtectedRoute from "@/react-app/components/ProtectedRoute";
import { NetworkBanner } from "@/react-app/components/NetworkBanner";
import { MultiChainWalletProvider } from "@/react-app/context/MultiChainWalletContext";
import { SubscriptionProvider } from "@/react-app/context/SubscriptionContext";
import { Toaster } from "react-hot-toast";

export default function App() {
  return (
    <Router>
      <MultiChainWalletProvider>
        <SubscriptionProvider>
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
        </SubscriptionProvider>
      </MultiChainWalletProvider>
    </Router>
  );
}


