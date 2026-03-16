import React from 'react';

export default function StatCard({ label, value, sub, icon, accent, style }) {
  return (
    <div style={{
      background: accent ? `linear-gradient(135deg, ${accent}22, ${accent}08)` : 'var(--bg-card)',
      border: `1px solid ${accent ? accent + '33' : 'var(--border)'}`,
      borderRadius: '16px',
      padding: '20px 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      ...style
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {label}
        </p>
        {icon && <span style={{ fontSize: '18px' }}>{icon}</span>}
      </div>
      <p style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '28px',
        fontWeight: '700',
        color: accent || 'var(--text)',
        lineHeight: 1
      }}>
        {value}
      </p>
      {sub && <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{sub}</p>}
    </div>
  );
}
