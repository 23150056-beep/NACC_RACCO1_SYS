import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, FormField, Input, Alert, Icon } from '../ui';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError('Invalid email or password.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="racco-sky-wash" style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, overflowY: 'auto' }}>
      <div style={{ width: 880, maxWidth: '100%', display: 'grid', gridTemplateColumns: '1.05fr 1fr', background: 'var(--surface)', borderRadius: 'var(--radius-2xl)', boxShadow: 'var(--shadow-xl)', overflow: 'hidden' }}>
        {/* Brand panel */}
        <div style={{ background: 'linear-gradient(155deg, var(--blue-700), var(--blue-600) 60%, var(--blue-800))', color: '#fff', padding: '40px 38px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden', minHeight: 480 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(120% 90% at 100% 0%, rgba(255,172,42,0.22), transparent 55%)' }} />
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 14 }}>
            <img src="/racco-seal.jpg" alt="RACCO I seal" style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover', boxShadow: 'var(--shadow-md)' }} />
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 26, lineHeight: 1 }}>RACCO I</div>
              <div style={{ fontSize: 12, opacity: 0.85, fontWeight: 600, letterSpacing: '0.02em' }}>Ilocos Region · Child Care Office</div>
            </div>
          </div>
          <div style={{ position: 'relative' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 30, lineHeight: 1.1 }}>
              In The Best Interests<br />of the Child
            </div>
            <p style={{ marginTop: 12, fontSize: 14, opacity: 0.85, lineHeight: 1.6, maxWidth: 320 }}>
              Behavioral Assessment &amp; Counseling Support System for the National Authority for Child Care.
            </p>
          </div>
          <div style={{ position: 'relative', fontSize: 11, opacity: 0.7, fontFamily: 'var(--font-mono)' }}>
            2/F Ordoña Bldg., MacArthur Highway, Bauang, La Union
          </div>
        </div>

        {/* Form panel */}
        <div style={{ padding: '40px 38px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'var(--text-strong)' }}>Sign in to your account</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Enter your agency credentials to continue.</p>

          <form onSubmit={submit} style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {error && <Alert tone="danger" icon={<Icon name="alert-triangle" size={18} />}>{error}</Alert>}
            <FormField label="Email">
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@racco1.gov.ph" leading={<Icon name="mail" size={16} />} required autoFocus />
            </FormField>
            <FormField label="Password">
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" leading={<Icon name="lock" size={16} />} required />
            </FormField>
            <Button type="submit" variant="primary" size="lg" fullWidth disabled={busy} iconRight={busy ? null : <Icon name="arrow-right" size={18} />}>
              {busy ? 'Signing in…' : 'Enter Workspace'}
            </Button>
          </form>

          <div style={{ marginTop: 18, padding: '11px 14px', borderRadius: 'var(--radius-md)', background: 'var(--ink-50)', border: '1px solid var(--border)', fontSize: 12.5, color: 'var(--text-muted)', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <Icon name="shield-check" size={16} style={{ color: 'var(--blue-600)', marginTop: 1 }} />
            <span>Access is role-scoped and every action is logged for audit under <strong style={{ color: 'var(--text-strong)' }}>RA&nbsp;10173</strong>.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
