import React, { useState } from 'react';
import API from '../utils/api';

export default function CalibrationModal({ onDone, onClose }) {
  const [step, setStep] = useState(0); // 0=intro, 1=reading, 2=done
  const [flexVal, setFlexVal] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const save = async () => {
    if (!flexVal || isNaN(flexVal)) return setError('Enter a valid number');
    setSaving(true);
    try {
      const { data } = await API.post('/user/calibrate', { flexValue: Number(flexVal) });
      setStep(2);
      setTimeout(() => onDone(data.user), 1500);
    } catch (e) {
      setError(e.response?.data?.error || 'Calibration failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={overlay}>
      <div style={modal}>
        <button onClick={onClose} style={closeBtn}>✕</button>
        {step === 0 && (
          <>
            <h2 style={h2}>Calibrate Your Sensor</h2>
            <p style={p}>
              Sit upright with <strong style={{ color: 'var(--accent)' }}>perfect posture</strong>.
              This reading will be your personal baseline. All future readings will compare against it.
            </p>
            <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Crect width='120' height='120' fill='%230d1526'/%3E%3Cpath d='M60 20 L60 80 M45 35 Q60 20 75 35 M48 60 Q60 50 72 60 M50 80 Q60 90 70 80' stroke='%2300e5ff' stroke-width='3' fill='none' stroke-linecap='round'/%3E%3Ccircle cx='60' cy='15' r='8' fill='%2300e5ff' opacity='0.3'/%3E%3C/svg%3E"
              alt="posture" style={{ display: 'block', margin: '20px auto' }} />
            <button style={btnPrimary} onClick={() => setStep(1)}>I'm Sitting Correctly →</button>
          </>
        )}
        {step === 1 && (
          <>
            <h2 style={h2}>Enter Sensor Reading</h2>
            <p style={p}>
              Check your Arduino Serial Monitor and enter the <strong style={{ color: 'var(--accent)' }}>flex sensor value</strong> shown while sitting upright.
            </p>
            <div style={{ margin: '20px 0' }}>
              <label style={label}>Flex Value (0 – 1023)</label>
              <input
                style={input}
                type="number"
                min="0"
                max="1023"
                placeholder="e.g. 210"
                value={flexVal}
                onChange={e => { setFlexVal(e.target.value); setError(''); }}
              />
            </div>
            {error && <p style={errStyle}>{error}</p>}
            <button style={btnPrimary} onClick={save} disabled={saving}>
              {saving ? 'Saving…' : 'Save Calibration ✓'}
            </button>
          </>
        )}
        {step === 2 && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>✅</div>
            <h2 style={h2}>Calibration Saved!</h2>
            <p style={p}>Your posture baseline has been recorded. Monitoring is now active.</p>
          </div>
        )}
      </div>
    </div>
  );
}

const overlay = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 1000, padding: '24px'
};
const modal = {
  background: 'var(--bg-card)', border: '1px solid var(--border)',
  borderRadius: '20px', padding: '36px', width: '100%', maxWidth: '420px',
  position: 'relative'
};
const closeBtn = {
  position: 'absolute', top: '16px', right: '16px',
  background: 'none', border: 'none', color: 'var(--text-muted)',
  fontSize: '18px', cursor: 'pointer'
};
const h2 = { fontFamily: 'var(--font-mono)', fontSize: '20px', marginBottom: '10px', color: 'var(--text)' };
const p = { fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6 };
const label = { display: 'block', fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' };
const input = {
  width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
  borderRadius: '10px', padding: '12px 16px', fontSize: '18px', color: 'var(--text)',
  fontFamily: 'var(--font-mono)', outline: 'none'
};
const errStyle = { color: 'var(--red)', fontSize: '13px', marginBottom: '8px' };
const btnPrimary = {
  width: '100%', padding: '14px', background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
  border: 'none', borderRadius: '12px', color: '#fff', fontFamily: 'var(--font-mono)',
  fontSize: '15px', fontWeight: '700', cursor: 'pointer', marginTop: '8px'
};
