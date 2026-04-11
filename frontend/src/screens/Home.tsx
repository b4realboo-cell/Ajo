// ════════════════════════════════════════════════════════
// Home.tsx
// ════════════════════════════════════════════════════════
import React, { useEffect, useState } from 'react';
import { useNetworkStore, useAuthStore, useUiStore } from '../store';
import { groupsApi, transactionsApi } from '../api';

export default function HomeScreen() {
  const { activeNetwork } = useNetworkStore();
  const { user } = useAuthStore();
  const { showModal } = useUiStore();
  const [groups, setGroups] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    if (!activeNetwork) return;
    groupsApi.list(activeNetwork.id).then(r => setGroups(r.data)).catch(() => {});
    transactionsApi.list(activeNetwork.id).then(r => setTransactions(r.data.data ?? [])).catch(() => {});
  }, [activeNetwork?.id]);

  if (!activeNetwork) return (
    <div style={{ padding: 32, textAlign: 'center', color: 'var(--muted)' }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>🌐</div>
      <p>Join or create a network to get started</p>
      <button className="btn-primary" style={{ maxWidth: 200, margin: '16px auto 0' }} onClick={() => showModal('create-network')}>Create Network</button>
    </div>
  );

  const balance = activeNetwork.wallet?.balance ?? 0;
  const currency = activeNetwork.currency ?? 'NGN';

  return (
    <div>
      {/* Wallet Card */}
      <div style={{ margin: '20px 20px 0', background: 'var(--ink)', borderRadius: 16, padding: 24, color: 'var(--paper)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, var(--gold) 0%, transparent 70%)', opacity: .25 }} />
        <div style={{ fontSize: 12, color: 'rgba(247,244,239,.6)', letterSpacing: '.05em', textTransform: 'uppercase', marginBottom: 6 }}>Network Wallet · {activeNetwork.name}</div>
        <div style={{ fontFamily: 'Fraunces, serif', fontSize: 38, fontWeight: 800, letterSpacing: -1, marginBottom: 2 }}>
          {currency === 'NGN' ? '₦' : currency === 'GBP' ? '£' : '$'}{balance.toLocaleString()}
        </div>
        <div style={{ fontSize: 12, color: 'rgba(247,244,239,.5)', marginBottom: 20 }}>
          <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: '#52b788', marginRight: 5, animation: 'ripple 2s infinite' }} />
          {activeNetwork.memberCount ?? '—'} members · {activeNetwork.role}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {['⬆ Pay Dues', '⬇ Withdraw', '↗ Transfer'].map(label => (
            <button key={label} onClick={() => showModal('pay')} style={{ flex: 1, background: 'rgba(247,244,239,.12)', border: '1px solid rgba(247,244,239,.2)', color: 'var(--paper)', borderRadius: 10, padding: 10, fontSize: 12, fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer' }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '16px 20px 4px' }}>
        {[
          { icon: '🎯', val: groups.length, label: 'Active Groups' },
          { icon: '👥', val: activeNetwork.memberCount ?? '—', label: 'Members' },
          { icon: '✅', val: transactions.filter((t: any) => t.status === 'COMPLETED').length, label: 'Completed Tx' },
          { icon: '📅', val: groups[0]?.nextDueDate ? new Date(groups[0].nextDueDate).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' }) : '—', label: 'Next Due' }
        ].map(({ icon, val, label }) => (
          <div key={label} style={{ background: 'var(--card)', borderRadius: 10, padding: 16, border: '1.5px solid var(--border)' }}>
            <div style={{ fontSize: 22, marginBottom: 8 }}>{icon}</div>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 700 }}>{val}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* My Groups */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 20px 12px' }}>
        <div style={{ fontFamily: 'Fraunces, serif', fontSize: 18, fontWeight: 600 }}>My Groups</div>
      </div>

      {groups.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '24px', color: 'var(--muted)', fontSize: 14 }}>
          No groups yet. <span style={{ color: 'var(--gold)', cursor: 'pointer' }} onClick={() => showModal('create-group')}>Create one →</span>
        </div>
      ) : groups.map((g: any) => (
        <GroupCard key={g.id} group={g} onPay={() => showModal('pay')} />
      ))}

      {/* Recent Transactions */}
      <div style={{ padding: '20px 20px 12px', fontFamily: 'Fraunces, serif', fontSize: 18, fontWeight: 600 }}>Recent Activity</div>
      {transactions.slice(0, 5).map((tx: any) => (
        <div key={tx.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderBottom: '1px solid var(--cream)' }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: tx.type === 'CONTRIBUTION_IN' ? 'var(--green-pale)' : 'var(--red-pale)', display: 'grid', placeItems: 'center', fontSize: 17 }}>
            {tx.type === 'CONTRIBUTION_IN' ? '⬆' : '⬇'}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 500 }}>{tx.description}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>{new Date(tx.createdAt).toLocaleDateString()}</div>
          </div>
          <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, color: tx.type === 'CONTRIBUTION_IN' ? 'var(--green)' : 'var(--red)' }}>
            {tx.type === 'CONTRIBUTION_IN' ? '+' : '-'}₦{(Number(tx.amount) / 100).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
}

function GroupCard({ group, onPay }: { group: any; onPay: () => void }) {
  const pct = Math.round((group.currentCycle / group.totalCycles) * 100);
  const amount = (Number(group.contributionAmount) / 100).toLocaleString();
  return (
    <div style={{ background: 'var(--card)', borderRadius: 16, margin: '0 20px 12px', border: '1.5px solid var(--border)', overflow: 'hidden', cursor: 'pointer' }}>
      <div style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 46, height: 46, borderRadius: 12, background: 'var(--gold-pale)', display: 'grid', placeItems: 'center', fontSize: 20 }}>💰</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 15 }}>{group.name}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{group._count?.members ?? '—'} members · ₦{amount}/{group.cycleType.toLowerCase()}</div>
        </div>
        <div style={{ fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 100, background: group.status === 'ACTIVE' ? 'var(--green-pale)' : 'var(--gold-pale)', color: group.status === 'ACTIVE' ? 'var(--green)' : 'var(--gold)' }}>
          {group.status}
        </div>
      </div>
      <div style={{ height: 4, background: 'var(--cream)' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, var(--gold), var(--gold-light))', transition: 'width .5s' }} />
      </div>
    </div>
  );
}
