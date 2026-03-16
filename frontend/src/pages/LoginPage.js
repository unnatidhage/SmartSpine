import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function LoginPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        await register(form.name, form.email, form.password);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* Background grid */}
      <div style={styles.grid} />

      {/* Glow orbs */}
      <div style={{ ...styles.orb, top: '10%', left: '15%', background: 'rgba(0,229,255,0.12)' }} />
      <div style={{ ...styles.orb, bottom: '15%', right: '10%', background: 'rgba(124,58,237,0.15)' }} />

      <div style={styles.card} className="animate-fade-up">
        {/* Logo area */}
        <div style={styles.logo}>
          <div style={styles.logoIcon}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C8 2 5 5 5 9c0 5 7 13 7 13s7-8 7-13c0-4-3-7-7-7z" stroke="#00e5ff" strokeWidth="1.5" fill="rgba(0,229,255,0.1)" />
              <circle cx="12" cy="9" r="2.5" fill="#00e5ff" />
              <path d="M12 11v4M9 13h6" stroke="#00e5ff" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <h1 style={styles.title}>SmartSpine <span style={{ color: 'var(--accent)' }}>AI</span></h1>
            <p style={styles.subtitle}>Intelligent posture monitoring vest</p>
          </div>
        </div>

        {/* Tab switcher */}
        <div style={styles.tabs}>
          {['login', 'register'].map(t => (
            <button key={t} onClick={() => { setMode(t); setError(''); }} style={{
              ...styles.tab,
              ...(mode === t ? styles.tabActive : {})
            }}>
              {t === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>

        <form onSubmit={handle} style={styles.form}>
          {mode === 'register' && (
            <div style={styles.field}>
              <label style={styles.label}>Full Name</label>
              <input
                style={styles.input}
                type="text"
                placeholder="John Doe"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
          )}
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              style={styles.input}
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" style={styles.btn} disabled={loading}>
            {loading ? 'Please wait...' : (mode === 'login' ? 'Start Monitoring →' : 'Create Account →')}
          </button>
        </form>

        <p style={styles.footer}>
          By continuing, you agree to our{' '}
          <span style={{ color: 'var(--accent)', cursor: 'pointer' }}>terms of service</span>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    position: 'relative',
    overflow: 'hidden',
    background: 'var(--bg-dark)'
  },
  grid: {
    position: 'absolute',
    inset: 0,
    backgroundImage: `
      linear-gradient(rgba(0,229,255,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,229,255,0.04) 1px, transparent 1px)
    `,
    backgroundSize: '40px 40px',
    pointerEvents: 'none'
  },
  orb: {
    position: 'absolute',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    filter: 'blur(80px)',
    pointerEvents: 'none'
  },
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '24px',
    padding: '40px',
    width: '100%',
    maxWidth: '440px',
    position: 'relative',
    zIndex: 1,
    boxShadow: '0 25px 80px rgba(0,0,0,0.6)'
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    marginBottom: '32px'
  },
  logoIcon: {
    width: '52px',
    height: '52px',
    background: 'rgba(0,229,255,0.08)',
    border: '1px solid rgba(0,229,255,0.2)',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    fontFamily: 'var(--font-mono)',
    fontSize: '22px',
    fontWeight: '700',
    color: 'var(--text)',
    letterSpacing: '-0.5px'
  },
  subtitle: {
    fontSize: '13px',
    color: 'var(--text-muted)',
    marginTop: '2px'
  },
  tabs: {
    display: 'flex',
    background: 'rgba(255,255,255,0.04)',
    borderRadius: '10px',
    padding: '4px',
    marginBottom: '28px',
    gap: '4px'
  },
  tab: {
    flex: 1,
    padding: '10px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontFamily: 'var(--font-sans)',
    fontSize: '14px',
    fontWeight: '500',
    background: 'transparent',
    color: 'var(--text-muted)',
    transition: 'all 0.2s'
  },
  tabActive: {
    background: 'var(--bg-card2)',
    color: 'var(--text)',
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
  },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' },
  input: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    padding: '12px 16px',
    fontSize: '15px',
    color: 'var(--text)',
    fontFamily: 'var(--font-sans)',
    outline: 'none',
    transition: 'border-color 0.2s'
  },
  error: { color: 'var(--red)', fontSize: '13px', textAlign: 'center', padding: '8px', background: 'rgba(239,68,68,0.1)', borderRadius: '8px' },
  btn: {
    marginTop: '8px',
    padding: '14px',
    background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
    border: 'none',
    borderRadius: '12px',
    color: '#fff',
    fontSize: '15px',
    fontWeight: '700',
    fontFamily: 'var(--font-mono)',
    cursor: 'pointer',
    letterSpacing: '0.3px',
    transition: 'opacity 0.2s'
  },
  footer: {
    marginTop: '20px',
    fontSize: '12px',
    color: 'var(--text-muted)',
    textAlign: 'center'
  }
};
