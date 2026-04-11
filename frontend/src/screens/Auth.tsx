// ═══════════════════════════════════════════════════════════════
// Onboarding.tsx
// ═══════════════════════════════════════════════════════════════
import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function OnboardingScreen() {
  const navigate = useNavigate();
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'var(--ink)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 30px', maxWidth: 430, margin: '0 auto' }}>
      <div style={{ fontFamily: 'Fraunces, serif', fontSize: 56, fontWeight: 800, color: 'var(--paper)', letterSpacing: -2, marginBottom: 8 }}>
        A<span style={{ color: 'var(--gold)' }}>jo</span>
      </div>
      <p style={{ color: 'rgba(247,244,239,.6)', fontSize: 16, textAlign: 'center', marginBottom: 48, maxWidth: 260, lineHeight: 1.5 }}>
        Your private digital thrift community. Save together, grow together.
      </p>
      <div style={{ display: 'flex', gap: 20, marginBottom: 48 }}>
        {[['🔒','Private\nNetworks'],['🔄','Rotating\nPayouts'],['🌍','Multi-\ncurrency'],['🛡️','KYC\nVerified']].map(([icon, label]) => (
          <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 48, height: 48, background: 'rgba(247,244,239,.08)', borderRadius: 14, display: 'grid', placeItems: 'center', fontSize: 22 }}>{icon}</div>
            <div style={{ fontSize: 11, color: 'rgba(247,244,239,.5)', textAlign: 'center', maxWidth: 60, whiteSpace: 'pre-line' }}>{label}</div>
          </div>
        ))}
      </div>
      <button onClick={() => navigate('/register')} style={{ width: '100%', background: 'var(--gold)', color: 'var(--ink)', border: 'none', borderRadius: 14, padding: 18, fontSize: 17, fontWeight: 700, fontFamily: 'Fraunces, serif', cursor: 'pointer', marginBottom: 12 }}>
        Get Started
      </button>
      <button onClick={() => navigate('/login')} style={{ width: '100%', background: 'transparent', color: 'var(--paper)', border: '1.5px solid rgba(247,244,239,.25)', borderRadius: 14, padding: 16, fontSize: 15, fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer' }}>
        I have an account → Sign In
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Login.tsx
// ═══════════════════════════════════════════════════════════════
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api';
import { useAuthStore } from '../store';
import AuthLayout from '../components/ui/AuthLayout';

export function LoginScreen() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return setError('Please fill all fields');
    setLoading(true); setError('');
    try {
      const { data } = await authApi.login(email, password);
      setAuth(data.user, data.accessToken, data.refreshToken);
      navigate('/app/home');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally { setLoading(false); }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your Ajo account">
      {error && <div style={{ background: 'var(--red-pale)', color: 'var(--red)', padding: '12px 14px', borderRadius: 10, fontSize: 13, marginBottom: 16 }}>{error}</div>}
      <label style={{ fontSize: 13, fontWeight: 500, marginBottom: 6, display: 'block' }}>Email</label>
      <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" />
      <label style={{ fontSize: 13, fontWeight: 500, marginBottom: 6, display: 'block' }}>Password</label>
      <input className="form-input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key === 'Enter' && handleLogin()} />
      <button className="btn-primary" onClick={handleLogin} disabled={loading}>{loading ? 'Signing in…' : 'Sign In'}</button>
      <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--muted)' }}>
        No account? <Link to="/register" style={{ color: 'var(--gold)', fontWeight: 600 }}>Create one</Link>
      </p>
    </AuthLayout>
  );
}
export default LoginScreen;

// ═══════════════════════════════════════════════════════════════
// Register.tsx
// ═══════════════════════════════════════════════════════════════
export function RegisterScreen() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!form.firstName || !form.email || !form.phone || !form.password) return setError('Please fill all fields');
    if (form.password.length < 8) return setError('Password must be at least 8 characters');
    setLoading(true); setError('');
    try {
      const { data } = await authApi.register(form);
      setAuth(data.user, data.accessToken, data.refreshToken);
      navigate('/verify-otp');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally { setLoading(false); }
  };

  const f = (field: string) => ({ value: (form as any)[field], onChange: (e: any) => setForm(s => ({ ...s, [field]: e.target.value })) });

  return (
    <AuthLayout title="Create Account" subtitle="Join Ajo and start saving together">
      {error && <div style={{ background: 'var(--red-pale)', color: 'var(--red)', padding: '12px 14px', borderRadius: 10, fontSize: 13, marginBottom: 16 }}>{error}</div>}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div><label style={{ fontSize: 13, fontWeight: 500, marginBottom: 6, display: 'block' }}>First Name</label><input className="form-input" {...f('firstName')} placeholder="Femi" /></div>
        <div><label style={{ fontSize: 13, fontWeight: 500, marginBottom: 6, display: 'block' }}>Last Name</label><input className="form-input" {...f('lastName')} placeholder="Olatunji" /></div>
      </div>
      <label style={{ fontSize: 13, fontWeight: 500, marginBottom: 6, display: 'block' }}>Email</label>
      <input className="form-input" type="email" {...f('email')} placeholder="you@email.com" />
      <label style={{ fontSize: 13, fontWeight: 500, marginBottom: 6, display: 'block' }}>Phone Number</label>
      <input className="form-input" type="tel" {...f('phone')} placeholder="+234 801 234 5678" />
      <label style={{ fontSize: 13, fontWeight: 500, marginBottom: 6, display: 'block' }}>Password</label>
      <input className="form-input" type="password" {...f('password')} placeholder="Min. 8 characters" />
      <button className="btn-primary" onClick={handleRegister} disabled={loading}>{loading ? 'Creating account…' : 'Create Account'}</button>
      <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--muted)' }}>
        Already registered? <Link to="/login" style={{ color: 'var(--gold)', fontWeight: 600 }}>Sign in</Link>
      </p>
    </AuthLayout>
  );
}

// ═══════════════════════════════════════════════════════════════
// VerifyOtp.tsx
// ═══════════════════════════════════════════════════════════════
export function VerifyOtpScreen() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'phone' | 'email'>('phone');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const verify = async () => {
    if (otp.length !== 6) return setError('Enter the 6-digit code');
    setLoading(true); setError('');
    try {
      await authApi.verifyOtp(step, otp);
      if (step === 'phone') { setStep('email'); setOtp(''); }
      else navigate('/kyc');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid code');
    } finally { setLoading(false); }
  };

  return (
    <AuthLayout title="Verify Your Account" subtitle={`Enter the 6-digit code sent to your ${step}`}>
      {error && <div style={{ background: 'var(--red-pale)', color: 'var(--red)', padding: '12px 14px', borderRadius: 10, fontSize: 13, marginBottom: 16 }}>{error}</div>}
      <div style={{ background: 'var(--gold-pale)', borderRadius: 10, padding: 14, marginBottom: 20, fontSize: 13, display: 'flex', gap: 10 }}>
        <span>📱</span>
        <span>Step {step === 'phone' ? '1' : '2'} of 2: Verifying your {step}</span>
      </div>
      <label style={{ fontSize: 13, fontWeight: 500, marginBottom: 6, display: 'block' }}>{step === 'phone' ? 'SMS' : 'Email'} Code</label>
      <input className="form-input" type="number" value={otp} onChange={e => setOtp(e.target.value.slice(0, 6))} placeholder="000000" style={{ fontFamily: 'monospace', fontSize: 28, textAlign: 'center', letterSpacing: 8 }} />
      <button className="btn-primary" onClick={verify} disabled={loading}>{loading ? 'Verifying…' : 'Verify'}</button>
      <button className="btn-secondary" style={{ marginTop: 10 }} onClick={() => setError('Resend feature — connect to backend')}>Resend Code</button>
    </AuthLayout>
  );
}

// ═══════════════════════════════════════════════════════════════
// Kyc.tsx
// ═══════════════════════════════════════════════════════════════
export function KycScreen() {
  const navigate = useNavigate();
  const [bvn, setBvn] = useState('');
  const [nin, setNin] = useState('');
  const [loading, setLoading] = useState(false);
  const { kycApi } = require('../api');

  const submitKyc = async () => {
    setLoading(true);
    try {
      if (bvn) await kycApi.verifyBvn(bvn);
      if (nin) await kycApi.verifyNin(nin);
      navigate('/app/home');
    } catch { } finally { setLoading(false); }
  };

  return (
    <AuthLayout title="Identity Verification" subtitle="Complete KYC to start saving with your community">
      <div style={{ background: 'var(--green-pale)', border: '1.5px solid rgba(45,106,79,.2)', borderRadius: 10, padding: 14, fontSize: 13, marginBottom: 20, display: 'flex', gap: 10 }}>
        <span>✅</span>
        <span>Phone and email verified. Complete identity checks to unlock all features.</span>
      </div>
      <label style={{ fontSize: 13, fontWeight: 500, marginBottom: 6, display: 'block' }}>BVN (Bank Verification Number)</label>
      <input className="form-input" value={bvn} onChange={e => setBvn(e.target.value.slice(0, 11))} placeholder="11-digit BVN" style={{ fontFamily: 'monospace', letterSpacing: 4 }} />
      <label style={{ fontSize: 13, fontWeight: 500, marginBottom: 6, display: 'block' }}>NIN (National Identity Number)</label>
      <input className="form-input" value={nin} onChange={e => setNin(e.target.value.slice(0, 11))} placeholder="11-digit NIN" style={{ fontFamily: 'monospace', letterSpacing: 4 }} />
      <button className="btn-primary" onClick={submitKyc} disabled={loading}>{loading ? 'Verifying…' : 'Submit KYC'}</button>
      <button className="btn-secondary" style={{ marginTop: 10 }} onClick={() => navigate('/app/home')}>Skip for now (limited access)</button>
    </AuthLayout>
  );
}
