import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useNetworkStore, useNotifStore, useChatStore, useUiStore } from '../store';

import HomeScreen from './Home';
import NetworksScreen from './Networks';
import GroupsScreen from './Groups';
import PaymentsScreen from './Payments';
import ProfileScreen from './Profile';
import NetworkSwitcherModal from '../components/modals/NetworkSwitcher';
import NotificationsModal from '../components/modals/Notifications';
import ChatModal from '../components/modals/Chat';
import Toast from '../components/ui/Toast';

const TABS = [
  { id: 'home', label: 'Home', icon: '🏠' },
  { id: 'networks', label: 'Networks', icon: '🌐' },
  { id: 'groups', label: 'Groups', icon: '👥' },
  { id: 'payments', label: 'Payments', icon: '💳' },
  { id: 'profile', label: 'Profile', icon: '👤' }
];

export default function AppShell() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('home');
  const { activeNetwork } = useNetworkStore();
  const { unreadCount } = useNotifStore();
  const { unreadCounts } = useChatStore();
  const { openModal, showModal, closeModal, toastMessage } = useUiStore();

  const chatUnread = activeNetwork ? (unreadCounts[activeNetwork.id] ?? 0) : 0;

  const switchTab = (id: string) => {
    setTab(id);
    navigate(`/app/${id}`);
  };

  return (
    <div style={{ maxWidth: 430, margin: '0 auto', minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--paper)', position: 'relative' }}>

      {/* ── Top Bar ─────────────────────────────────────── */}
      <header style={{ position: 'sticky', top: 0, zIndex: 100, background: 'var(--paper)', borderBottom: '1.5px solid var(--border)', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div
          onClick={() => showModal('network-switcher')}
          style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--ink)', color: 'var(--paper)', borderRadius: 100, padding: '6px 14px 6px 8px', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
        >
          <NetworkDot network={activeNetwork} />
          <span>{activeNetwork?.name ?? 'Select Network'}</span>
          <span style={{ fontSize: 11 }}>⌄</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <IconBtn onClick={() => showModal('notifications')} badge={unreadCount > 0}>🔔</IconBtn>
          <IconBtn onClick={() => showModal('chat')} badge={chatUnread > 0}>💬</IconBtn>
        </div>
      </header>

      {/* ── Screen Content ──────────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 80 }}>
        <Routes>
          <Route path="home" element={<HomeScreen />} />
          <Route path="networks" element={<NetworksScreen />} />
          <Route path="groups" element={<GroupsScreen />} />
          <Route path="payments" element={<PaymentsScreen />} />
          <Route path="profile" element={<ProfileScreen />} />
          <Route path="*" element={<HomeScreen />} />
        </Routes>
      </div>

      {/* ── Bottom Navigation ───────────────────────────── */}
      <nav style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 430, background: 'var(--card)', borderTop: '1.5px solid var(--border)', display: 'flex', zIndex: 100, paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => switchTab(t.id)}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '10px 0 6px', border: 'none', background: 'transparent', cursor: 'pointer', color: tab === t.id ? 'var(--ink)' : 'var(--muted)', fontSize: 10, fontWeight: 500, fontFamily: 'inherit', transition: 'color .15s' }}>
            <span style={{ fontSize: 20 }}>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </nav>

      {/* ── Modals ──────────────────────────────────────── */}
      {openModal === 'network-switcher' && <NetworkSwitcherModal onClose={closeModal} />}
      {openModal === 'notifications' && <NotificationsModal onClose={closeModal} />}
      {openModal === 'chat' && <ChatModal onClose={closeModal} />}

      {/* ── Toast ───────────────────────────────────────── */}
      {toastMessage && <Toast message={toastMessage} />}
    </div>
  );
}

function NetworkDot({ network }: { network: any }) {
  const initials = network ? network.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase() : '?';
  return (
    <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--gold)', display: 'grid', placeItems: 'center', fontSize: 9, fontWeight: 700, color: 'var(--ink)', flexShrink: 0 }}>
      {initials}
    </div>
  );
}

function IconBtn({ children, onClick, badge }: { children: React.ReactNode; onClick: () => void; badge?: boolean }) {
  return (
    <button onClick={onClick} style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--cream)', border: 'none', display: 'grid', placeItems: 'center', cursor: 'pointer', fontSize: 17, position: 'relative' }}>
      {children}
      {badge && <span style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: '50%', background: 'var(--gold)', border: '2px solid var(--paper)' }} />}
    </button>
  );
}
