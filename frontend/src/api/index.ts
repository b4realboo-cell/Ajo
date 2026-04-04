import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../store';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

// ─── Axios instance ───────────────────────────────────────────
const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
});

// ─── Request interceptor — attach JWT ────────────────────────
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Response interceptor — auto refresh on 401 ──────────────
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => error ? reject(error) : resolve(token));
  failedQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => failedQueue.push({ resolve, reject }))
          .then((token) => { original.headers.Authorization = `Bearer ${token}`; return api(original); });
      }
      original._retry = true;
      isRefreshing = true;
      try {
        const { refreshToken } = useAuthStore.getState();
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
        useAuthStore.getState().updateToken(data.accessToken, data.refreshToken);
        processQueue(null, data.accessToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch (err) {
        processQueue(err, null);
        useAuthStore.getState().clearAuth();
        window.location.href = '/login';
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth API ─────────────────────────────────────────────────
export const authApi = {
  register: (data: { email: string; phone: string; password: string; firstName: string; lastName: string }) =>
    api.post('/auth/register', data),
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  me: () => api.get('/auth/me'),
  verifyOtp: (type: 'phone' | 'email', otp: string) =>
    api.post('/auth/verify-otp', { type, otp }),
  logout: () => useAuthStore.getState().clearAuth()
};

// ─── KYC API ─────────────────────────────────────────────────
export const kycApi = {
  status: () => api.get('/kyc/status'),
  verifyBvn: (bvn: string) => api.post('/kyc/verify-bvn', { bvn }),
  verifyNin: (nin: string) => api.post('/kyc/verify-nin', { nin })
};

// ─── Networks API ─────────────────────────────────────────────
export const networksApi = {
  list: () => api.get('/networks'),
  get: (networkId: string) => api.get(`/networks/${networkId}`),
  create: (data: any) => api.post('/networks', data),
  update: (networkId: string, data: any) => api.patch(`/networks/${networkId}`, data),
  join: (inviteCode: string) => api.post('/networks/join', { inviteCode }),
  invite: (networkId: string, email: string) =>
    api.post(`/networks/${networkId}/members/invite`, { email }),
  members: (networkId: string) => api.get(`/networks/${networkId}/members`),
  removeMember: (networkId: string, memberId: string) =>
    api.delete(`/networks/${networkId}/members/${memberId}`),
  updateRole: (networkId: string, memberId: string, role: string) =>
    api.patch(`/networks/${networkId}/members/${memberId}/role`, { role }),
  auditLog: (networkId: string) => api.get(`/networks/${networkId}/audit-log`)
};

// ─── Groups API ───────────────────────────────────────────────
export const groupsApi = {
  list: (networkId: string) => api.get(`/networks/${networkId}/groups`),
  create: (networkId: string, data: any) => api.post(`/networks/${networkId}/groups`, data),
  join: (networkId: string, groupId: string) =>
    api.post(`/networks/${networkId}/groups/${groupId}/join`),
  start: (networkId: string, groupId: string) =>
    api.post(`/networks/${networkId}/groups/${groupId}/start`),
  rotation: (networkId: string, groupId: string) =>
    api.get(`/networks/${networkId}/groups/${groupId}/rotation`),
  contributions: (networkId: string, groupId: string) =>
    api.get(`/networks/${networkId}/groups/${groupId}/contributions`),
  payouts: (networkId: string, groupId: string) =>
    api.get(`/networks/${networkId}/groups/${groupId}/payouts`)
};

// ─── Contributions API ────────────────────────────────────────
export const contributionsApi = {
  pay: (networkId: string, data: { groupId: string; method: string; amount?: number }) =>
    api.post(`/networks/${networkId}/contributions`, data),
  confirm: (networkId: string, contributionId: string) =>
    api.patch(`/networks/${networkId}/contributions/${contributionId}/confirm`)
};

// ─── Transactions API ─────────────────────────────────────────
export const transactionsApi = {
  list: (networkId: string, page = 1) =>
    api.get(`/networks/${networkId}/transactions?page=${page}`)
};

// ─── Disputes API ────────────────────────────────────────────
export const disputesApi = {
  list: (networkId: string) => api.get(`/networks/${networkId}/disputes`),
  create: (networkId: string, data: { title: string; description: string }) =>
    api.post(`/networks/${networkId}/disputes`, data),
  resolve: (networkId: string, disputeId: string, resolution: string) =>
    api.patch(`/networks/${networkId}/disputes/${disputeId}/resolve`, { resolution })
};

// ─── Messages API ─────────────────────────────────────────────
export const messagesApi = {
  list: (networkId: string) => api.get(`/networks/${networkId}/messages`)
};

// ─── Notifications API ───────────────────────────────────────
export const notificationsApi = {
  list: (networkId: string) => api.get(`/networks/${networkId}/notifications`),
  markRead: (networkId: string, id: string) =>
    api.patch(`/networks/${networkId}/notifications/${id}/read`)
};

// ─── API Keys ─────────────────────────────────────────────────
export const apiKeysApi = {
  list: (networkId: string) => api.get(`/networks/${networkId}/api-keys`),
  create: (networkId: string, data: any) => api.post(`/networks/${networkId}/api-keys`, data),
  revoke: (networkId: string, keyId: string) =>
    api.delete(`/networks/${networkId}/api-keys/${keyId}`)
};

// ─── Webhooks API ────────────────────────────────────────────
export const webhooksApi = {
  list: (networkId: string) => api.get(`/networks/${networkId}/webhooks`),
  create: (networkId: string, data: any) => api.post(`/networks/${networkId}/webhooks`, data),
  update: (networkId: string, webhookId: string, data: any) =>
    api.patch(`/networks/${networkId}/webhooks/${webhookId}`, data),
  delete: (networkId: string, webhookId: string) =>
    api.delete(`/networks/${networkId}/webhooks/${webhookId}`),
  test: (networkId: string, webhookId: string) =>
    api.post(`/networks/${networkId}/webhooks/${webhookId}/test`)
};

export default api;
