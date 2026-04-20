import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore, useNetworkStore } from './store';
import { authApi, networksApi } from './api';
import { useSocket } from './hooks/useSocket';
import { setupPushNotifications, setStatusBar } from './hooks/useNative';

// Screens
import OnboardingScreen from './screens/Onboarding';
import LoginScreen from './screens/Login';
import RegisterScreen from './screens/Register';
import VerifyOtpScreen from './screens/VerifyOtp';
import KycScreen from './screens/Kyc';
import AppShell from './screens/AppShell';

// ─── Route guard ─────────────────────────────────────────────
function Protected({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function Public({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  return !isAuthenticated ? <>{children}</> : <Navigate to="/app" replace />;
}

// ─── App root ─────────────────────────────────────────────────
export default function App() {
  const { isAuthenticated, setUser } = useAuthStore();
  const { setNetworks } = useNetworkStore();
  useSocket(); // Initialize socket connection

  useEffect(() => {
    setStatusBar(false);
    if (isAuthenticated) {
      // Hydrate user and networks
      authApi.me().then(({ data }) => {
        setUser(data);
        setupPushNotifications(data.id);
      }).catch(() => {});

      networksApi.list().then(({ data }) => {
        const networks = data.map((m: any) => ({
          id: m.network.id,
          name: m.network.name,
          slug: m.network.slug,
          currency: m.network.currency,
          avatarUrl: m.network.avatarUrl,
          role: m.role,
          wallet: m.network.wallets?.[0]
        }));
        setNetworks(networks);
      }).catch(() => {});
    }
  }, [isAuthenticated]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Public><OnboardingScreen /></Public>} />
        <Route path="/login" element={<Public><LoginScreen /></Public>} />
        <Route path="/register" element={<Public><RegisterScreen /></Public>} />
        <Route path="/verify-otp" element={<Protected><VerifyOtpScreen /></Protected>} />
        <Route path="/kyc" element={<Protected><KycScreen /></Protected>} />
        <Route path="/app/*" element={<Protected><AppShell /></Protected>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
