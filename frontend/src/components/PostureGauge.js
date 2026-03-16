import React from 'react';

const COLORS = {
  Excellent: '#22c55e',
  Good: '#f59e0b',
  default: '#ef4444'
};

export default function PostureGauge({ score, status }) {
  const color = COLORS[status?.split(' ')[0]] || COLORS.default;
  const radius = 54;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (score / 100) * circ;

  return (
    <div style={styles.wrap}>
      <svg width="160" height="160" viewBox="0 0 160 160" style={{ transform: 'rotate(-90deg)' }}>
        {/* Background ring */}
        <circle cx="80" cy="80" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="12" />
        {/* Score ring */}
        <circle
          cx="80" cy="80" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s ease, stroke 0.5s ease', filter: `drop-shadow(0 0 8px ${color})` }}
        />
      </svg>
      <div style={styles.center}>
        <span style={{ ...styles.score, color }}>{score}</span>
        <span style={styles.pct}>/ 100</span>
      </div>
    </div>
  );
}

const styles = {
  wrap: {
    position: 'relative',
    width: '160px',
    height: '160px',
    flexShrink: 0
  },
  center: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  score: {
    fontFamily: 'var(--font-mono)',
    fontSize: '36px',
    fontWeight: '700',
    lineHeight: 1
  },
  pct: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    fontFamily: 'var(--font-mono)'
  }
};
