// ════════════════════════════════════════════════════════
// Networks.tsx
// ════════════════════════════════════════════════════════
import React, { useState } from 'react';
import { useNetworkStore, useUiStore } from '../store';
import { networksApi } from '../api';
import BottomSheet from '../components/ui/BottomSheet';

export function NetworksScreen() {
  const { networks, activeNetworkId, setActiveNetwork, addNetwork } = useNetworkStore();
  const { showToast } = useUiStore();
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', description: '', currency: 'NGN', visibility: 'PRIVATE' });
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!createForm.name) return showToast('Network name required');
    setLoading(true);
    try {
      const { data } = await networksApi.create(createForm);
      addNetwork({ ...data, role: 'OWNER' });
      setActiveNetwork(data.id);
      setShowCreate(false);
      showToast('Network created! ✓');
    } catch (err: any) {
      showToast(err.response?.data?.error ?? 'Failed to create network');
    } finally { setLoading(false); }
  };

  const handleJoin = async () => {
    if (!inviteCode) return showToast('Enter invite code');
    setLoading(true);
    try {
      await networksApi.join(inviteCode);
      showToast('Request sent!');
      setShowJoin(false);
    } catch (err: any) {
      showToast(err.response?.data?.error ?? 'Failed to join');
    } finally { setLoading(false); }
  };

  return (
    <div>
      <div style={{ padding: 20, background: 'linear-gradient(135deg, var(--ink) 0%, #1a2030 100%)', color: 'var(--paper)' }}>
        <div style={{ fontFamily: 'Fraunces, serif', fontSize: 26, fontWeight: 800, marginBottom: 4 }}>My Networks</div>
        <p style={{ fontSize: 13, color: 'rgba(247,244,239,.6)' }}>Switch between your private savings communities.</p>
      </div>

      <div style={{ margin: '16px 20px', background: 'var(--gold-pale)', border: '1.5px solid rgba(200,150,62,.3)', borderRadius: 10, padding: '12px 16px', display: 'flex', gap: 12 }}>
        <span style={{ fontSize: 20 }}>🔐</span>
        <div style={{ fontSize: 12, lineHeight: 1.5 }}><strong style={{ color: 'var(--gold)' }}>Full privacy guaranteed.</strong> No platform admin can see your network data, transactions, or member information.</div>
      </div>

      <div style={{ padding: '0 20px' }}>
        {networks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--muted)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🌐</div>
            <p>No networks yet. Create or join one!</p>
          </div>
        ) : networks.map(net => (
          <div key={net.id} onClick={() => setActiveNetwork(net.id)}
            style={{ background: 'var(--card)', borderRadius: 16, border: `1.5px solid ${net.id === activeNetworkId ? 'var(--gold)' : 'var(--border)'}`, padding: 16, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', boxShadow: net.id === activeNetworkId ? '0 0 0 3px rgba(200,150,62,.15)' : 'none', transition: 'all .15s' }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: net.id === activeNetworkId ? 'var(--gold-pale)' : 'var(--cream)', display: 'grid', placeItems: 'center', fontSize: 22, fontWeight: 700, color: 'var(--gold)', flexShrink: 0 }}>
              {net.name[0]}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{net.name}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{net.role} · {net.memberCount ?? '—'} members</div>
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 100, background: net.role === 'OWNER' ? 'var(--ink)' : 'var(--gold-pale)', color: net.role === 'OWNER' ? 'var(--gold)' : 'var(--gold)' }}>
              {net.role}
            </div>
          </div>
        ))}

        <button className="btn-primary" onClick={() => setShowCreate(true)}>+ Create New Network</button>
        <button className="btn-secondary" style={{ marginTop: 10 }} onClick={() => setShowJoin(true)}>Enter Invite Code</button>
      </div>

      {/* Create Network Sheet */}
      {showCreate && (
        <BottomSheet title="Create a Network" subtitle="Your private savings community — fully isolated." onClose={() => setShowCreate(false)}>
          {(['name','description'] as const).map(field => (
            <div key={field}>
              <label className="form-label">{field === 'name' ? 'Network Name' : 'Description (optional)'}</label>
              <input className="form-input" value={(createForm as any)[field]} onChange={e => setCreateForm(s => ({ ...s, [field]: e.target.value }))} placeholder={field === 'name' ? 'e.g. Okafor Family Ajo' : 'What is this for?'} />
            </div>
          ))}
          <label className="form-label">Currency</label>
          <select className="form-input form-select" value={createForm.currency} onChange={e => setCreateForm(s => ({ ...s, currency: e.target.value }))}>
            <option value="NGN">NGN — Nigerian Naira</option>
            <option value="USD">USD — US Dollar</option>
            <option value="GBP">GBP — British Pound</option>
            <option value="GHS">GHS — Ghanaian Cedi</option>
          </select>
          <label className="form-label">Visibility</label>
          <select className="form-input form-select" value={createForm.visibility} onChange={e => setCreateForm(s => ({ ...s, visibility: e.target.value }))}>
            <option value="PRIVATE">Private (invite only)</option>
            <option value="SEMI_PRIVATE">Semi-private (link access)</option>
          </select>
          <button className="btn-primary" onClick={handleCreate} disabled={loading}>{loading ? 'Creating…' : 'Create Network'}</button>
          <button className="btn-secondary" style={{ marginTop: 10 }} onClick={() => setShowCreate(false)}>Cancel</button>
        </BottomSheet>
      )}

      {/* Join Network Sheet */}
      {showJoin && (
        <BottomSheet title="Join a Network" subtitle="Enter the invite code shared by a network admin." onClose={() => setShowJoin(false)}>
          <label className="form-label">Invite Code</label>
          <input className="form-input" value={inviteCode} onChange={e => setInviteCode(e.target.value.toUpperCase())} placeholder="AJO-XXXX-XXXX" style={{ fontFamily: 'monospace', letterSpacing: '.1em' }} />
          <button className="btn-primary" onClick={handleJoin} disabled={loading}>{loading ? 'Joining…' : 'Request to Join'}</button>
          <button className="btn-secondary" style={{ marginTop: 10 }} onClick={() => setShowJoin(false)}>Cancel</button>
        </BottomSheet>
      )}
    </div>
  );
}
export default NetworksScreen;

// ════════════════════════════════════════════════════════
// Groups.tsx
// ════════════════════════════════════════════════════════
export function GroupsScreen() {
  const { activeNetwork } = useNetworkStore();
  const { showToast } = useUiStore();
  const [groups, setGroups] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter] = useState('All');
  const [form, setForm] = useState({ name: '', cycleType: 'MONTHLY', contributionAmount: '', maxMembers: '', payoutOrder: 'RANDOM', startDate: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!activeNetwork) return;
    groupsApi.list(activeNetwork.id).then(r => setGroups(r.data)).catch(() => {});
  }, [activeNetwork?.id]);

  const handleCreate = async () => {
    if (!form.name || !form.contributionAmount || !form.maxMembers) return showToast('Fill all required fields');
    setLoading(true);
    try {
      const { data } = await groupsApi.create(activeNetwork!.id, {
        ...form, contributionAmount: Number(form.contributionAmount), maxMembers: Number(form.maxMembers)
      });
      setGroups(g => [data, ...g]);
      setShowCreate(false);
      showToast('Group created! ✓');
    } catch (err: any) { showToast(err.response?.data?.error ?? 'Failed to create group'); }
    finally { setLoading(false); }
  };

  const filtered = groups.filter(g => filter === 'All' || g.status === filter.toUpperCase() || g.cycleType === filter.toUpperCase());

  return (
    <div>
      <div style={{ padding: '20px 20px 0' }}>
        <div style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 700 }}>Contribution Groups</div>
        <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 3 }}>{activeNetwork?.name} · {groups.length} groups</div>
      </div>
      <div style={{ display: 'flex', gap: 8, padding: '16px 20px 8px', overflowX: 'auto', scrollbarWidth: 'none' }}>
        {['All','Active','Forming','Completed','Monthly','Weekly','Daily'].map(f => (
          <div key={f} onClick={() => setFilter(f)} style={{ background: f === filter ? 'var(--ink)' : 'var(--card)', color: f === filter ? 'var(--paper)' : 'var(--ink)', border: '1.5px solid var(--border)', borderRadius: 100, padding: '7px 16px', fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', cursor: 'pointer', flexShrink: 0 }}>{f}</div>
        ))}
      </div>

      {filtered.map((g: any) => (
        <div key={g.id} style={{ background: 'var(--card)', borderRadius: 16, margin: '8px 20px', border: '1.5px solid var(--border)', overflow: 'hidden' }}>
          <div style={{ padding: 16, borderBottom: '1px solid var(--cream)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ fontFamily: 'Fraunces, serif', fontSize: 17, fontWeight: 600 }}>{g.name}</div>
              <div style={{ fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 100, background: g.status === 'ACTIVE' ? 'var(--green-pale)' : 'var(--gold-pale)', color: g.status === 'ACTIVE' ? 'var(--green)' : 'var(--gold)' }}>{g.status}</div>
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>{g._count?.members ?? 0} members · {g.cycleType}</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderBottom: '1px solid var(--cream)' }}>
            {[['₦' + (Number(g.contributionAmount)/100).toLocaleString(), 'Contribution'], [(Number(g.contributionAmount)/100 * (g._count?.members??1)).toLocaleString(), 'Pot Size'], [`${g.currentCycle}/${g.totalCycles}`, 'Cycle']].map(([v, l]) => (
              <div key={l} style={{ padding: 12, textAlign: 'center', borderRight: '1px solid var(--cream)' }}>
                <div style={{ fontFamily: 'Fraunces, serif', fontSize: 15, fontWeight: 700 }}>{v}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
          <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>Due: <strong>{g.nextDueDate ? new Date(g.nextDueDate).toLocaleDateString() : 'TBD'}</strong></div>
            <button onClick={() => showToast('Opening payment flow...')} style={{ background: 'var(--gold)', color: 'var(--ink)', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>Pay Now</button>
          </div>
        </div>
      ))}

      <div style={{ padding: 20 }}>
        <button className="btn-primary" onClick={() => setShowCreate(true)}>+ Create Group</button>
      </div>

      {showCreate && (
        <BottomSheet title="Create Group" subtitle="Set up a contribution cycle for your network." onClose={() => setShowCreate(false)}>
          <label className="form-label">Group Name *</label>
          <input className="form-input" value={form.name} onChange={e => setForm(s => ({ ...s, name: e.target.value }))} placeholder="e.g. Q2 Monthly Ajo" />
          <label className="form-label">Cycle Type *</label>
          <select className="form-input form-select" value={form.cycleType} onChange={e => setForm(s => ({ ...s, cycleType: e.target.value }))}>
            {['MONTHLY','WEEKLY','DAILY'].map(c => <option key={c} value={c}>{c.charAt(0) + c.slice(1).toLowerCase()}</option>)}
          </select>
          <label className="form-label">Contribution Amount (₦) *</label>
          <input className="form-input" type="number" value={form.contributionAmount} onChange={e => setForm(s => ({ ...s, contributionAmount: e.target.value }))} placeholder="e.g. 25000" />
          <label className="form-label">Max Members *</label>
          <input className="form-input" type="number" value={form.maxMembers} onChange={e => setForm(s => ({ ...s, maxMembers: e.target.value }))} placeholder="e.g. 10" />
          <label className="form-label">Payout Order</label>
          <select className="form-input form-select" value={form.payoutOrder} onChange={e => setForm(s => ({ ...s, payoutOrder: e.target.value }))}>
            <option value="RANDOM">Random (shuffled)</option>
            <option value="FIXED">Fixed (admin assigns)</option>
            <option value="BID_BASED">Bid-based</option>
          </select>
          <label className="form-label">Start Date</label>
          <input className="form-input" type="date" value={form.startDate} onChange={e => setForm(s => ({ ...s, startDate: e.target.value }))} />
          <button className="btn-primary" onClick={handleCreate} disabled={loading}>{loading ? 'Creating…' : 'Create Group'}</button>
          <button className="btn-secondary" style={{ marginTop: 10 }} onClick={() => setShowCreate(false)}>Cancel</button>
        </BottomSheet>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════
// Payments.tsx  
// ════════════════════════════════════════════════════════
export function PaymentsScreen() {
  const { activeNetwork } = useNetworkStore();
  const { showToast } = useUiStore();
  const [tab, setTab] = useState<'pay'|'tx'|'payouts'>('pay');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [payMethod, setPayMethod] = useState('CARD_STRIPE');
  const [amount, setAmount] = useState('25000');
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState('');

  useEffect(() => {
    if (!activeNetwork) return;
    transactionsApi.list(activeNetwork.id).then(r => setTransactions(r.data.data ?? [])).catch(() => {});
    groupsApi.list(activeNetwork.id).then(r => { setGroups(r.data); if (r.data[0]) setSelectedGroup(r.data[0].id); }).catch(() => {});
  }, [activeNetwork?.id]);

  const handlePay = async () => {
    if (!selectedGroup || !amount) return showToast('Select group and amount');
    setLoading(true);
    try {
      const { data } = await contributionsApi.pay(activeNetwork!.id, { groupId: selectedGroup, method: payMethod, amount: Number(amount) });
      if (data.bankDetails) showToast(`Transfer to: ${data.bankDetails.accountNumber} · Ref: ${data.bankDetails.reference}`);
      else if (data.ussdCode) showToast(`Dial: ${data.ussdCode}`);
      else showToast('Payment initiated ✓');
    } catch (err: any) { showToast(err.response?.data?.error ?? 'Payment failed'); }
    finally { setLoading(false); }
  };

  const METHODS = [
    { id: 'APPLE_PAY', icon: '🍎', name: 'Apple Pay', desc: 'Instant · Touch ID / Face ID', badge: 'Fastest' },
    { id: 'CARD_STRIPE', icon: '💳', name: 'Card — Stripe', desc: 'Visa, Mastercard · PCI Secure', badge: null },
    { id: 'BANK_TRANSFER', icon: '🏦', name: 'Bank Transfer', desc: 'Manual transfer · Reference tracking', badge: null },
    { id: 'USSD', icon: '📱', name: 'USSD', desc: 'No internet needed · Any phone', badge: null }
  ];

  return (
    <div>
      <div style={{ padding: '20px 20px 0' }}>
        <div style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 700 }}>Payments</div>
        <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 3 }}>Manage dues, transfers & payouts</div>
      </div>

      <div style={{ display: 'flex', gap: 0, background: 'var(--cream)', borderRadius: 10, padding: 3, margin: '16px 20px' }}>
        {([['pay','Pay Dues'],['tx','Transactions'],['payouts','Payouts']] as const).map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{ flex: 1, padding: 8, fontSize: 13, fontWeight: 500, border: 'none', background: tab === id ? 'var(--card)' : 'transparent', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', color: tab === id ? 'var(--ink)' : 'var(--muted)', boxShadow: tab === id ? 'var(--shadow)' : 'none' }}>{label}</button>
        ))}
      </div>

      {tab === 'pay' && (
        <div style={{ padding: '0 20px' }}>
          {groups.length > 0 && (
            <><label className="form-label">Group</label>
            <select className="form-input form-select" value={selectedGroup} onChange={e => setSelectedGroup(e.target.value)}>
              {groups.map((g: any) => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select></>
          )}
          <label className="form-label">Amount (₦)</label>
          <div style={{ position: 'relative', marginBottom: 16 }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontFamily: 'Fraunces, serif', fontSize: 20, color: 'var(--muted)' }}>₦</span>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} style={{ width: '100%', background: 'var(--card)', border: '1.5px solid var(--border)', borderRadius: 10, padding: '12px 14px 12px 32px', fontSize: 24, fontFamily: 'Fraunces, serif', fontWeight: 600, color: 'var(--ink)', outline: 'none' }} />
          </div>
          <label className="form-label" style={{ marginBottom: 8 }}>Payment Method</label>
          {METHODS.map(m => (
            <div key={m.id} onClick={() => setPayMethod(m.id)} style={{ background: m.id === payMethod ? 'var(--gold-pale)' : 'var(--card)', border: `1.5px solid ${m.id === payMethod ? 'var(--gold)' : 'var(--border)'}`, borderRadius: 10, padding: 16, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', transition: 'all .15s' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--cream)', display: 'grid', placeItems: 'center', fontSize: 20, flexShrink: 0 }}>{m.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{m.name}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{m.desc}</div>
              </div>
              {m.badge && <div style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 100, background: 'var(--gold)', color: 'var(--ink)' }}>{m.badge}</div>}
            </div>
          ))}
          <button className="btn-primary" onClick={handlePay} disabled={loading}>{loading ? 'Processing…' : `Pay ₦${Number(amount).toLocaleString()}`}</button>
        </div>
      )}

      {tab === 'tx' && (
        <div style={{ padding: '0 20px' }}>
          {transactions.length === 0 ? <div style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>No transactions yet</div> : transactions.map((tx: any) => (
            <div key={tx.id} style={{ background: 'var(--card)', borderRadius: 10, padding: 14, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12, border: '1.5px solid var(--cream)' }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: tx.type === 'CONTRIBUTION_IN' ? 'var(--green-pale)' : 'var(--red-pale)', display: 'grid', placeItems: 'center', fontSize: 17 }}>{tx.type === 'CONTRIBUTION_IN' ? '⬆' : '⬇'}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{tx.description}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>{new Date(tx.createdAt).toLocaleDateString()}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 15, color: tx.type === 'CONTRIBUTION_IN' ? 'var(--green)' : 'var(--red)' }}>₦{(Number(tx.amount)/100).toLocaleString()}</div>
                <div style={{ fontSize: 11, color: tx.status === 'COMPLETED' ? 'var(--green)' : tx.status === 'PENDING' ? '#856404' : 'var(--red)' }}>{tx.status}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'payouts' && (
        <div style={{ padding: '0 20px' }}>
          <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 12, fontWeight: 600 }}>PAYOUT ROTATION SCHEDULE</div>
          {groups.map((g: any) => (
            <div key={g.id} style={{ marginBottom: 20 }}>
              <div style={{ fontFamily: 'Fraunces, serif', fontSize: 15, fontWeight: 600, marginBottom: 10 }}>{g.name}</div>
              {[...Array(Math.min(g._count?.members || 0, 5))].map((_, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--cream)' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: i + 1 === g.currentCycle ? 'var(--gold)' : 'var(--cream)', display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 700, color: i + 1 === g.currentCycle ? 'var(--ink)' : 'var(--muted)', flexShrink: 0 }}>{i + 1}</div>
                  <div style={{ flex: 1, fontSize: 14 }}>Member {i + 1}{i + 1 === g.currentCycle ? ' ← Next' : ''}</div>
                  <div style={{ fontSize: 12, color: i < g.currentCycle - 1 ? 'var(--green)' : 'var(--muted)' }}>{i < g.currentCycle - 1 ? '✓ Paid' : 'Scheduled'}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════
// Profile.tsx
// ════════════════════════════════════════════════════════
export function ProfileScreen() {
  const { user } = useAuthStore();
  const { showToast, showModal } = useUiStore();

  if (!user) return null;
  const initials = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  const kycLevelLabel = ['None', 'Basic', 'Standard', 'Full'][user.kycLevel] ?? 'Unknown';

  return (
    <div>
      <div style={{ padding: '24px 20px 20px', display: 'flex', alignItems: 'center', gap: 16, background: 'linear-gradient(180deg, var(--cream) 0%, transparent 100%)' }}>
        <div style={{ width: 68, height: 68, borderRadius: '50%', background: 'var(--ink)', display: 'grid', placeItems: 'center', fontFamily: 'Fraunces, serif', fontSize: 26, color: 'var(--gold)', fontWeight: 700 }}>{initials}</div>
        <div>
          <div style={{ fontFamily: 'Fraunces, serif', fontSize: 20, fontWeight: 700 }}>{user.firstName} {user.lastName}</div>
          <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 3 }}>{user.email}</div>
          <div style={{ color: 'var(--green)', fontSize: 12, marginTop: 4 }}>✓ KYC {kycLevelLabel} · {user.kycStatus}</div>
        </div>
      </div>

      <div style={{ margin: '0 20px 16px', background: 'var(--green-pale)', border: '1.5px solid rgba(45,106,79,.2)', borderRadius: 10, padding: 14, display: 'flex', gap: 12 }}>
        <span style={{ fontSize: 22 }}>🛡️</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--green)' }}>Identity Verified — Level {user.kycLevel}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
            {[['📱', 'Phone', user.phoneVerified], ['📧', 'Email', user.emailVerified], ['🏦', 'BVN', user.bvnVerified], ['🪪', 'NIN', user.ninVerified]].map(([icon, label, done]) => (
              <span key={label as string} style={{ marginRight: 10, color: done ? 'var(--green)' : 'var(--muted)' }}>{icon} {done ? '✓' : '○'} {label}</span>
            ))}
          </div>
        </div>
      </div>

      {[
        { label: 'Account', items: [{ icon: '👤', title: 'Edit Profile', sub: 'Name, photo, contact details' }, { icon: '🪪', title: 'KYC & Verification', sub: 'ID documents, BVN, NIN' }, { icon: '🏦', title: 'Linked Banks', sub: 'Add or remove bank accounts' }] },
        { label: 'Security', items: [{ icon: '🔒', title: 'Biometric Login', sub: 'Face ID / Touch ID', toggle: true }, { icon: '📲', title: 'Two-Factor Auth', sub: 'SMS & Authenticator' }, { icon: '📋', title: 'Audit Log', sub: 'View all account actions', action: () => showModal('audit-log') }] },
        { label: 'Network Tools', items: [{ icon: '⚖️', title: 'Dispute Center', sub: 'Open & resolved disputes', action: () => showModal('disputes') }, { icon: '🔌', title: 'API Connector', sub: 'Integrate with your systems', action: () => showModal('api-connector') }, { icon: '🔔', title: 'Notifications', sub: 'Dues, payouts, messages' }] },
        { label: 'Support', items: [{ icon: '❓', title: 'Help Center' }, { icon: '💬', title: 'Contact Support' }, { icon: '🚪', title: 'Sign Out', danger: true, action: () => { useAuthStore.getState().clearAuth(); window.location.href = '/'; } }] }
      ].map(section => (
        <div key={section.label} style={{ padding: '0 20px 16px' }}>
          <div style={{ background: 'var(--card)', borderRadius: 10, border: '1.5px solid var(--border)', overflow: 'hidden' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', padding: '14px 16px 8px' }}>{section.label}</div>
            {section.items.map((item: any, i) => (
              <div key={item.title} onClick={item.action ?? (() => showToast(`Opening ${item.title}…`))} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderTop: i > 0 ? '1px solid var(--cream)' : 'none', cursor: 'pointer' }}>
                <span style={{ fontSize: 18, width: 28, textAlign: 'center', color: item.danger ? 'var(--red)' : 'inherit' }}>{item.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: item.danger ? 'var(--red)' : 'var(--ink)' }}>{item.title}</div>
                  {item.sub && <div style={{ fontSize: 12, color: 'var(--muted)' }}>{item.sub}</div>}
                </div>
                {item.toggle ? <div style={{ width: 44, height: 26, background: 'var(--green)', borderRadius: 100 }} /> : <span style={{ color: 'var(--muted)' }}>›</span>}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
