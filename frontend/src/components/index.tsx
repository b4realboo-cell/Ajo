// ════════════════════════════════════════════════════════
// ui/BottomSheet.tsx
// ════════════════════════════════════════════════════════
import React, { useEffect } from 'react';

interface Props { title: string; subtitle?: string; onClose: () => void; children: React.ReactNode; }

export default function BottomSheet({ title, subtitle, onClose, children }: Props) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(14,14,14,.5)', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', backdropFilter: 'blur(2px)' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'var(--paper)', borderRadius: '24px 24px 0 0', width: '100%', maxWidth: 430, maxHeight: '92vh', overflowY: 'auto', padding: '20px 20px calc(20px + env(safe-area-inset-bottom))', animation: 'slideUp .3s cubic-bezier(.32,1,.3,1)' }}>
        <div style={{ width: 40, height: 4, background: 'var(--border)', borderRadius: 2, margin: '0 auto 20px' }} />
        <div style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 700, marginBottom: subtitle ? 6 : 20 }}>{title}</div>
        {subtitle && <div style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 24 }}>{subtitle}</div>}
        {children}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════
// ui/Toast.tsx
// ════════════════════════════════════════════════════════
export function Toast({ message }: { message: string }) {
  return (
    <div style={{ position: 'fixed', bottom: 90, left: '50%', transform: 'translateX(-50%)', background: 'var(--ink)', color: 'var(--paper)', borderRadius: 100, padding: '10px 20px', fontSize: 13, fontWeight: 500, zIndex: 300, whiteSpace: 'nowrap', boxShadow: 'var(--shadow-lg)', pointerEvents: 'none', animation: 'fadeIn .2s ease' }}>
      {message}
    </div>
  );
}

// ════════════════════════════════════════════════════════
// ui/AuthLayout.tsx
// ════════════════════════════════════════════════════════
export function AuthLayout({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)', display: 'flex', flexDirection: 'column', padding: '60px 24px 40px', maxWidth: 430, margin: '0 auto' }}>
      <div style={{ fontFamily: 'Fraunces, serif', fontSize: 32, fontWeight: 800, letterSpacing: -1, marginBottom: 8 }}>A<span style={{ color: 'var(--gold)' }}>jo</span></div>
      <div style={{ fontFamily: 'Fraunces, serif', fontSize: 24, fontWeight: 700, marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 32 }}>{subtitle}</div>
      {children}
    </div>
  );
}

// ════════════════════════════════════════════════════════
// modals/NetworkSwitcher.tsx
// ════════════════════════════════════════════════════════
export function NetworkSwitcherModal({ onClose }: { onClose: () => void }) {
  const { networks, activeNetworkId, setActiveNetwork } = useNetworkStore();
  return (
    <BottomSheet title="Switch Network" subtitle="Your data is fully isolated per network." onClose={onClose}>
      {networks.map(net => (
        <div key={net.id} onClick={() => { setActiveNetwork(net.id); onClose(); }}
          style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 14, background: 'var(--card)', borderRadius: 10, marginBottom: 10, border: `1.5px solid ${net.id === activeNetworkId ? 'var(--gold)' : 'var(--border)'}`, cursor: 'pointer' }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--cream)', display: 'grid', placeItems: 'center', fontSize: 20 }}>{net.name[0]}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600 }}>{net.name}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>{net.role}</div>
          </div>
          {net.id === activeNetworkId && <span style={{ color: 'var(--gold)' }}>✓ Active</span>}
        </div>
      ))}
      <button className="btn-secondary" onClick={onClose}>Cancel</button>
    </BottomSheet>
  );
}

// ════════════════════════════════════════════════════════
// modals/Chat.tsx
// ════════════════════════════════════════════════════════
export function ChatModal({ onClose }: { onClose: () => void }) {
  const { activeNetwork } = useNetworkStore();
  const { messages, setMessages, markRead } = useChatStore();
  const { sendMessage } = useSocket();
  const { user } = useAuthStore();
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!activeNetwork) return;
    messagesApi.list(activeNetwork.id).then(r => setMessages(activeNetwork.id, r.data)).catch(() => {});
    markRead(activeNetwork.id);
  }, [activeNetwork?.id]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages[activeNetwork?.id ?? '']?.length]);

  const send = () => {
    if (!input.trim() || !activeNetwork) return;
    sendMessage(activeNetwork.id, input.trim());
    setInput('');
  };

  const netMessages = messages[activeNetwork?.id ?? ''] ?? [];

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(14,14,14,.5)', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', backdropFilter: 'blur(2px)' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'var(--paper)', borderRadius: '24px 24px 0 0', width: '100%', maxWidth: 430, height: '85vh', display: 'flex', flexDirection: 'column', animation: 'slideUp .3s cubic-bezier(.32,1,.3,1)' }}>
        <div style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1.5px solid var(--border)' }}>
          <div style={{ width: 40, height: 4, background: 'var(--border)', borderRadius: 2, position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)' }} />
          <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--gold-pale)', display: 'grid', placeItems: 'center', fontSize: 18, marginTop: 8 }}>{activeNetwork?.name[0]}</div>
          <div style={{ flex: 1, marginTop: 8 }}>
            <div style={{ fontWeight: 600 }}>{activeNetwork?.name}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>Network Chat</div>
          </div>
          <button onClick={onClose} style={{ background: 'var(--cream)', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', fontSize: 14, marginTop: 8 }}>✕</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {netMessages.length === 0 && <div style={{ textAlign: 'center', color: 'var(--muted)', padding: 32 }}>No messages yet. Start the conversation!</div>}
          {netMessages.map((msg: any) => {
            const mine = msg.senderId === user?.id;
            return (
              <div key={msg.id} style={{ maxWidth: '78%', alignSelf: mine ? 'flex-end' : 'flex-start' }}>
                {!mine && <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 3, fontWeight: 500 }}>{msg.sender?.firstName ?? 'Member'}</div>}
                <div style={{ padding: '10px 14px', borderRadius: 16, fontSize: 14, lineHeight: 1.4, background: mine ? 'var(--ink)' : 'var(--card)', color: mine ? 'var(--paper)' : 'var(--ink)', border: mine ? 'none' : '1.5px solid var(--cream)', borderBottomRightRadius: mine ? 4 : 16, borderBottomLeftRadius: mine ? 16 : 4 }}>
                  {msg.content}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
        <div style={{ padding: '12px 16px', borderTop: '1.5px solid var(--border)', display: 'flex', gap: 8, paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder={`Message ${activeNetwork?.name ?? ''}…`} style={{ flex: 1, background: 'var(--cream)', border: 'none', borderRadius: 100, padding: '10px 16px', fontSize: 14, fontFamily: 'inherit', outline: 'none' }} />
          <button onClick={send} style={{ width: 40, height: 40, background: 'var(--ink)', border: 'none', borderRadius: '50%', display: 'grid', placeItems: 'center', cursor: 'pointer', color: 'var(--paper)', fontSize: 16 }}>➤</button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════
// modals/Notifications.tsx
// ════════════════════════════════════════════════════════
export function NotificationsModal({ onClose }: { onClose: () => void }) {
  const { notifications } = useNotifStore();
  const { activeNetwork } = useNetworkStore();

  return (
    <BottomSheet title="Notifications" onClose={onClose}>
      {notifications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 32, color: 'var(--muted)' }}>All caught up!</div>
      ) : notifications.map(n => (
        <div key={n.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--cream)', opacity: n.read ? .6 : 1 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--gold-pale)', display: 'grid', placeItems: 'center', fontSize: 17 }}>🔔</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 500 }}>{n.title}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>{n.body}</div>
          </div>
          <div style={{ fontSize: 11, color: 'var(--muted)', whiteSpace: 'nowrap' }}>{new Date(n.createdAt).toLocaleDateString()}</div>
        </div>
      ))}
      <button className="btn-secondary" style={{ marginTop: 12 }} onClick={onClose}>Close</button>
    </BottomSheet>
  );
}

// ════════════════════════════════════════════════════════
// modals/ApiConnector.tsx — Full API management UI
// ════════════════════════════════════════════════════════
export function ApiConnectorModal({ onClose }: { onClose: () => void }) {
  const { activeNetwork } = useNetworkStore();
  const { showToast } = useUiStore();
  const [tab, setTab] = useState<'keys'|'endpoints'|'webhooks'>('keys');
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [newKey, setNewKey] = useState<any>(null);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!activeNetwork) return;
    apiKeysApi.list(activeNetwork.id).then(r => setApiKeys(r.data)).catch(() => {});
    webhooksApi.list(activeNetwork.id).then(r => setWebhooks(r.data)).catch(() => {});
  }, [activeNetwork?.id]);

  const createKey = async (type: string) => {
    setLoading(true);
    try {
      const { data } = await apiKeysApi.create(activeNetwork!.id, { name: `${activeNetwork!.name} ${type} Key`, type, permissions: ['read:members','read:transactions','write:contributions'] });
      setNewKey(data);
      setApiKeys(k => [...k, data]);
    } catch { showToast('Failed to create key'); }
    finally { setLoading(false); }
  };

  const revokeKey = async (keyId: string) => {
    try {
      await apiKeysApi.revoke(activeNetwork!.id, keyId);
      setApiKeys(k => k.filter(key => key.id !== keyId));
      showToast('Key revoked');
    } catch { showToast('Failed to revoke'); }
  };

  const createWebhook = async () => {
    if (!webhookUrl) return showToast('Enter a URL');
    setLoading(true);
    try {
      const { data } = await webhooksApi.create(activeNetwork!.id, {
        url: webhookUrl,
        events: ['contribution.paid', 'payout.completed', 'member.joined', 'member.removed', 'contribution.missed', 'dispute.opened', 'dispute.resolved']
      });
      setWebhooks(w => [...w, data]);
      setWebhookUrl('');
      showToast('Webhook saved! ✓');
    } catch { showToast('Failed to save webhook'); }
    finally { setLoading(false); }
  };

  const ENDPOINTS = [
    { method: 'GET', path: '/v1/networks/:id/members', desc: 'List all members in a network' },
    { method: 'GET', path: '/v1/networks/:id/groups', desc: 'Fetch all contribution groups' },
    { method: 'POST', path: '/v1/networks/:id/contributions', desc: 'Record a contribution payment' },
    { method: 'GET', path: '/v1/networks/:id/transactions', desc: 'Get transaction ledger' },
    { method: 'POST', path: '/v1/networks/:id/payouts', desc: 'Trigger payout to next member' },
    { method: 'DELETE', path: '/v1/networks/:id/members/:uid', desc: 'Remove a member' },
    { method: 'GET', path: '/v1/users/:id/kyc', desc: 'Check user KYC status' },
    { method: 'POST', path: '/v1/networks/:id/disputes', desc: 'Create a dispute record' },
    { method: 'GET', path: '/v1/networks/:id/summary', desc: 'Network summary stats' },
  ];

  const METHOD_COLORS: any = { GET: ['var(--green-pale)', 'var(--green)'], POST: ['var(--blue-pale)', 'var(--blue)'], DELETE: ['var(--red-pale)', 'var(--red)'] };

  return (
    <BottomSheet title="API Connector" subtitle="Integrate Ajo with your systems. All access is network-scoped." onClose={onClose}>
      <div style={{ display: 'flex', gap: 0, background: 'var(--cream)', borderRadius: 10, padding: 3, marginBottom: 20 }}>
        {(['keys', 'endpoints', 'webhooks'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: 8, fontSize: 13, fontWeight: 500, border: 'none', background: tab === t ? 'var(--card)' : 'transparent', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', color: tab === t ? 'var(--ink)' : 'var(--muted)', boxShadow: tab === t ? 'var(--shadow)' : 'none', textTransform: 'capitalize' }}>{t}</button>
        ))}
      </div>

      {tab === 'keys' && (
        <>
          <div style={{ background: 'var(--ink)', color: 'var(--paper)', borderRadius: 16, padding: 20, marginBottom: 16 }}>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{activeNetwork?.name} API Keys</div>
            <div style={{ fontSize: 13, color: 'rgba(247,244,239,.6)', marginBottom: 16 }}>Keys are network-scoped. Cannot access other networks.</div>
            {newKey && (
              <div style={{ background: 'rgba(247,244,239,.08)', borderRadius: 8, padding: '10px 12px', marginBottom: 12, border: '1px solid rgba(247,244,239,.15)' }}>
                <div style={{ fontSize: 11, color: 'rgba(247,244,239,.5)', marginBottom: 4 }}>NEW KEY — COPY NOW, NOT SHOWN AGAIN</div>
                <div style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--gold-light)', wordBreak: 'break-all' }}>{newKey.key}</div>
                <button onClick={() => { navigator.clipboard.writeText(newKey.key); showToast('Copied!'); }} style={{ marginTop: 8, background: 'rgba(247,244,239,.15)', border: 'none', color: 'var(--paper)', borderRadius: 6, padding: '4px 10px', fontSize: 11, cursor: 'pointer' }}>Copy Key</button>
              </div>
            )}
            {apiKeys.map((k: any) => (
              <div key={k.id} style={{ background: 'rgba(247,244,239,.06)', borderRadius: 8, padding: '10px 12px', marginBottom: 8, border: '1px solid rgba(247,244,239,.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--paper)' }}>{k.name}</div>
                  <div style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--gold-light)' }}>{k.prefix}••••••••</div>
                </div>
                <button onClick={() => revokeKey(k.id)} style={{ background: 'rgba(192,57,43,.3)', border: '1px solid rgba(192,57,43,.4)', color: 'var(--paper)', borderRadius: 6, padding: '4px 10px', fontSize: 11, cursor: 'pointer' }}>Revoke</button>
              </div>
            ))}
          </div>
          <button className="btn-primary" onClick={() => createKey('SECRET')} disabled={loading}>{loading ? 'Generating…' : '+ Generate Secret Key'}</button>
          <button className="btn-secondary" style={{ marginTop: 10 }} onClick={() => createKey('PUBLISHABLE')}>+ Generate Publishable Key</button>
        </>
      )}

      {tab === 'endpoints' && (
        <>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 12 }}>
            Base URL: <code style={{ background: 'var(--cream)', padding: '2px 6px', borderRadius: 4, fontSize: 11 }}>https://api.ajo.app</code>
            <br /><br />Authentication: <code style={{ background: 'var(--cream)', padding: '2px 6px', borderRadius: 4, fontSize: 11 }}>X-Api-Key: your_secret_key</code>
          </div>
          {ENDPOINTS.map(ep => (
            <div key={ep.path} style={{ background: 'var(--card)', border: '1.5px solid var(--border)', borderRadius: 10, padding: 14, marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6, fontFamily: 'monospace', background: METHOD_COLORS[ep.method][0], color: METHOD_COLORS[ep.method][1] }}>{ep.method}</span>
                <span style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--ink)' }}>{ep.path}</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>{ep.desc}</div>
            </div>
          ))}
        </>
      )}

      {tab === 'webhooks' && (
        <>
          <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>Receive real-time event notifications. We send a POST with an HMAC-signed payload.</div>
          {['contribution.paid','payout.completed','member.joined','member.removed','contribution.missed','dispute.opened','dispute.resolved'].map(event => (
            <div key={event} style={{ background: 'var(--blue-pale)', border: '1.5px solid rgba(26,86,160,.2)', borderRadius: 8, padding: '10px 14px', marginBottom: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--blue)', fontFamily: 'monospace' }}>{event}</div>
            </div>
          ))}
          {webhooks.map((wh: any) => (
            <div key={wh.id} style={{ background: 'var(--card)', border: '1.5px solid var(--border)', borderRadius: 10, padding: 14, marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{wh.url}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>{wh.events?.length} events · {wh.active ? '🟢 Active' : '🔴 Inactive'}</div>
              </div>
              <button onClick={() => webhooksApi.test(activeNetwork!.id, wh.id).then(() => showToast('Test sent ✓'))} style={{ fontSize: 12, padding: '6px 12px', border: '1.5px solid var(--border)', borderRadius: 8, cursor: 'pointer', background: 'transparent', fontFamily: 'inherit' }}>Test</button>
            </div>
          ))}
          <label className="form-label" style={{ marginTop: 8 }}>Webhook Endpoint URL</label>
          <input className="form-input" type="url" value={webhookUrl} onChange={e => setWebhookUrl(e.target.value)} placeholder="https://your-server.com/ajo-events" />
          <button className="btn-primary" onClick={createWebhook} disabled={loading}>{loading ? 'Saving…' : 'Save Webhook'}</button>
        </>
      )}
    </BottomSheet>
  );
}
