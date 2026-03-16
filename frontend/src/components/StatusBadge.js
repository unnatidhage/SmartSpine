import React from 'react';

const CONFIG = {
  'Excellent':         { color: '#22c55e', bg: 'rgba(34,197,94,0.12)',  icon: '🟢' },
  'Good':              { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', icon: '🟡' },
  'Poor – Forward Head': { color: '#f97316', bg: 'rgba(249,115,22,0.12)', icon: '🟠' },
  'Critical – Slouching': { color: '#ef4444', bg: 'rgba(239,68,68,0.12)', icon: '🔴' },
};

export default function StatusBadge({ status, large }) {
  const cfg = CONFIG[status] || { color: 'var(--text-muted)', bg: 'rgba(255,255,255,0.06)', icon: '⚪' };
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: large ? '8px 16px' : '4px 10px',
      borderRadius: '999px',
      background: cfg.bg,
      border: `1px solid ${cfg.color}33`,
      color: cfg.color,
      fontFamily: 'var(--font-mono)',
      fontSize: large ? '15px' : '12px',
      fontWeight: '700',
      letterSpacing: '0.3px'
    }}>
      <span style={{ fontSize: large ? '14px' : '10px' }}>{cfg.icon}</span>
      {status || 'Waiting…'}
    </span>
  );
}
