import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ─── Types ────────────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  kycStatus: string;
  kycLevel: number;
  phoneVerified: boolean;
  emailVerified: boolean;
  bvnVerified: boolean;
  ninVerified: boolean;
  faceVerified: boolean;
}

export interface Network {
  id: string;
  name: string;
  slug: string;
  currency: string;
  avatarUrl?: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
  memberCount?: number;
  groupCount?: number;
  wallet?: { balance: number; currency: string };
}

export interface Group {
  id: string;
  networkId: string;
  name: string;
  cycleType: string;
  contributionAmount: number;
  maxMembers: number;
  currentCycle: number;
  totalCycles: number;
  status: string;
  nextDueDate?: string;
  nextPayoutDate?: string;
  memberCount?: number;
  myMembership?: { payoutPosition: number };
}

export interface Message {
  id: string;
  networkId: string;
  senderId: string;
  content: string;
  type: string;
  createdAt: string;
  sender?: { firstName: string; lastName: string };
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

// ─── Auth Store ───────────────────────────────────────────────
interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  setUser: (user: User) => void;
  clearAuth: () => void;
  updateToken: (accessToken: string, refreshToken: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      setAuth: (user, accessToken, refreshToken) =>
        set({ user, accessToken, refreshToken, isAuthenticated: true }),
      setUser: (user) => set({ user }),
      clearAuth: () => set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false }),
      updateToken: (accessToken, refreshToken) => set({ accessToken, refreshToken })
    }),
    { name: 'ajo-auth', partialize: (s) => ({ accessToken: s.accessToken, refreshToken: s.refreshToken }) }
  )
);

// ─── Network Store ────────────────────────────────────────────
interface NetworkState {
  networks: Network[];
  activeNetworkId: string | null;
  activeNetwork: Network | null;
  setNetworks: (networks: Network[]) => void;
  setActiveNetwork: (networkId: string) => void;
  addNetwork: (network: Network) => void;
}

export const useNetworkStore = create<NetworkState>()(
  persist(
    (set, get) => ({
      networks: [],
      activeNetworkId: null,
      activeNetwork: null,
      setNetworks: (networks) => {
        const activeId = get().activeNetworkId;
        const active = networks.find(n => n.id === activeId) ?? networks[0] ?? null;
        set({ networks, activeNetwork: active, activeNetworkId: active?.id ?? null });
      },
      setActiveNetwork: (networkId) => {
        const network = get().networks.find(n => n.id === networkId) ?? null;
        set({ activeNetworkId: networkId, activeNetwork: network });
      },
      addNetwork: (network) => set(s => ({ networks: [...s.networks, network] }))
    }),
    { name: 'ajo-network', partialize: (s) => ({ activeNetworkId: s.activeNetworkId }) }
  )
);

// ─── UI Store ─────────────────────────────────────────────────
interface UiState {
  activeTab: string;
  openModal: string | null;
  toastMessage: string | null;
  isLoading: boolean;
  setTab: (tab: string) => void;
  showModal: (modal: string) => void;
  closeModal: () => void;
  showToast: (msg: string) => void;
  setLoading: (v: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  activeTab: 'home',
  openModal: null,
  toastMessage: null,
  isLoading: false,
  setTab: (tab) => set({ activeTab: tab }),
  showModal: (modal) => set({ openModal: modal }),
  closeModal: () => set({ openModal: null }),
  showToast: (msg) => {
    set({ toastMessage: msg });
    setTimeout(() => set({ toastMessage: null }), 2800);
  },
  setLoading: (v) => set({ isLoading: v })
}));

// ─── Chat Store ───────────────────────────────────────────────
interface ChatState {
  messages: Record<string, Message[]>; // networkId -> messages
  unreadCounts: Record<string, number>;
  addMessage: (networkId: string, msg: Message) => void;
  setMessages: (networkId: string, msgs: Message[]) => void;
  markRead: (networkId: string) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: {},
  unreadCounts: {},
  addMessage: (networkId, msg) =>
    set(s => ({
      messages: { ...s.messages, [networkId]: [...(s.messages[networkId] ?? []), msg] },
      unreadCounts: { ...s.unreadCounts, [networkId]: (s.unreadCounts[networkId] ?? 0) + 1 }
    })),
  setMessages: (networkId, msgs) =>
    set(s => ({ messages: { ...s.messages, [networkId]: msgs } })),
  markRead: (networkId) =>
    set(s => ({ unreadCounts: { ...s.unreadCounts, [networkId]: 0 } }))
}));

// ─── Notifications Store ──────────────────────────────────────
interface NotifState {
  notifications: Notification[];
  unreadCount: number;
  setNotifications: (n: Notification[]) => void;
  addNotification: (n: Notification) => void;
  markRead: (id: string) => void;
}

export const useNotifStore = create<NotifState>((set) => ({
  notifications: [],
  unreadCount: 0,
  setNotifications: (notifications) =>
    set({ notifications, unreadCount: notifications.filter(n => !n.read).length }),
  addNotification: (n) =>
    set(s => ({ notifications: [n, ...s.notifications], unreadCount: s.unreadCount + 1 })),
  markRead: (id) =>
    set(s => ({
      notifications: s.notifications.map(n => n.id === id ? { ...n, read: true } : n),
      unreadCount: Math.max(0, s.unreadCount - 1)
    }))
}));
