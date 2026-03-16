import React, { useState, useEffect, useCallback } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, Legend
} from 'recharts';
import { Activity, Wifi, WifiOff, Settings, LogOut, Bell, TrendingUp } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { usePostureSocket } from '../hooks/usePostureSocket';
import PostureGauge from '../components/PostureGauge';
import StatusBadge from '../components/StatusBadge';
import StatCard from '../components/StatCard';
import CalibrationModal from '../components/CalibrationModal';
import API from '../utils/api';

const MAX_POINTS = 30;

export default function Dashboard() {
  const { user, logout, updateUser } = useAuth();
  const { latest, connected } = usePostureSocket(user?._id);

  const [history, setHistory] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [stats, setStats] = useState(null);
  const [showCalib, setShowCalib] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [aiAdvice, setAiAdvice] = useState('Waiting for sensor data...');

  // ── Load history on mount
  useEffect(() => {
    if (!user) return;
    API.get(`/data/history/${user._id}?limit=50`)
      .then(({ data }) => {
        setHistory(data);
        const pts = data.map(r => ({
          time: new Date(r.timestamp).toLocaleTimeString(),
          score: r.score,
          flex: r.flexValue
        }));
        setChartData(pts.slice(-MAX_POINTS));
      }).catch(() => {});

    API.get(`/data/stats/${user._id}`)
      .then(({ data }) => setStats(data))
      .catch(() => {});
  }, [user]);

  // ── Real-time socket update
  useEffect(() => {
    if (!latest) return;

    const point = {
      time: latest.timestamp.toLocaleTimeString(),
      score: latest.score,
      flex: latest.flexValue
    };
    setChartData(prev => [...prev.slice(-(MAX_POINTS - 1)), point]);
    setAiAdvice(latest.advice || '');

    // Alert on critical posture
    if (latest.riskLevel === 'critical' || latest.riskLevel === 'high') {
      const alert = {
        id: Date.now(),
        msg: `⚠️ ${latest.status} detected at ${latest.timestamp.toLocaleTimeString()}`,
        color: latest.riskLevel === 'critical' ? 'var(--red)' : 'var(--orange)'
      };
      setAlerts(prev => [alert, ...prev].slice(0, 5));
    }
  }, [latest]);

  // ── Demo mode: simulate sensor if not calibrated / no real device
  useEffect(() => {
    if (connected) return; // real device connected, skip demo
    const interval = setInterval(() => {
      const mockFlex = Math.floor(Math.random() * 160) + 160; // 160-320
      const calibVal = user?.calibrationValue || 200;
      const diff = Math.abs(mockFlex - calibVal);
      let score, status, advice;
      if (diff < 20)      { score = 90 + Math.floor(Math.random()*8); status = 'Excellent';             advice = 'Great posture! Keep it up.'; }
      else if (diff < 50) { score = 70 + Math.floor(Math.random()*12); status = 'Good';                advice = 'Minor curvature. Sit upright.'; }
      else if (diff < 100){ score = 45 + Math.floor(Math.random()*15); status = 'Poor – Forward Head'; advice = 'Forward head posture. Roll shoulders back.'; }
      else                { score = 20 + Math.floor(Math.random()*20); status = 'Critical – Slouching'; advice = 'Severe slouching! Risk of sciatica. Adjust now!'; }

      const point = { time: new Date().toLocaleTimeString(), score, flex: mockFlex };
      setChartData(prev => [...prev.slice(-(MAX_POINTS - 1)), point]);
      setAiAdvice(advice);

      if (status === 'Critical – Slouching') {
        setAlerts(prev => [{
          id: Date.now(),
          msg: `⚠️ Critical slouching at ${new Date().toLocaleTimeString()}`,
          color: 'var(--red)'
        }, ...prev].slice(0, 5));
      }
    }, 2500);
    return () => clearInterval(interval);
  }, [connected, user]);

  const currentScore = chartData.length ? chartData[chartData.length - 1].score : 0;
  const currentStatus = latest?.status || (chartData.length ? getStatusFromScore(chartData[chartData.length-1].score) : 'Waiting…');

  const handleCalibDone = useCallback((updatedUser) => {
    updateUser(updatedUser);
    setShowCalib(false);
  }, [updateUser]);

  // Custom tooltip for chart
  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: 'var(--bg-card2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px 14px' }}>
        <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)', fontSize: '18px', fontWeight: '700' }}>{payload[0]?.value}</p>
        <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Posture Score</p>
        {payload[1] && <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Flex: {payload[1].value}</p>}
      </div>
    );
  };

  return (
    <div style={styles.root}>
      {/* ── Navbar */}
      <nav style={styles.nav}>
        <div style={styles.navBrand}>
          <Activity size={20} color="var(--accent)" />
          <span style={styles.navTitle}>SmartSpine <span style={{ color: 'var(--accent)' }}>AI</span></span>
        </div>
        <div style={styles.navRight}>
          {/* Live indicator */}
          <div style={styles.liveChip}>
            {connected
              ? <><Wifi size={13} color="#22c55e" /> <span style={{ color: '#22c55e' }}>LIVE</span></>
              : <><WifiOff size={13} color="var(--text-muted)" /> <span style={{ color: 'var(--text-muted)' }}>DEMO</span></>
            }
          </div>
          <button style={styles.navBtn} onClick={() => setShowCalib(true)} title="Calibrate">
            <Settings size={16} />
          </button>
          <button style={{ ...styles.navBtn, color: 'var(--red)' }} onClick={logout} title="Logout">
            <LogOut size={16} />
          </button>
          <div style={styles.avatar}>{user?.name?.[0]?.toUpperCase()}</div>
        </div>
      </nav>

      <main style={styles.main}>
        {/* ── Welcome row */}
        <div style={styles.welcomeRow}>
          <div>
            <h2 style={styles.welcomeTitle}>Hello, {user?.name?.split(' ')[0]} 👋</h2>
            <p style={styles.welcomeSub}>
              {user?.isCalibrated
                ? 'Your posture monitoring is active. Sensor baseline is set.'
                : <span style={{ color: 'var(--amber)' }}>⚠️ Sensor not calibrated. <button style={styles.inlineLink} onClick={() => setShowCalib(true)}>Calibrate now →</button></span>
              }
            </p>
          </div>
          <StatusBadge status={currentStatus} large />
        </div>

        {/* ── Top row: Gauge + Stats */}
        <div style={styles.topGrid}>
          {/* Gauge card */}
          <div style={styles.gaugeCard} className="animate-glow">
            <p style={styles.cardLabel}>POSTURE SCORE</p>
            <PostureGauge score={currentScore} status={currentStatus} />
            <p style={styles.adviceText}>{aiAdvice}</p>
          </div>

          {/* Stats column */}
          <div style={styles.statsGrid}>
            <StatCard label="Avg Score" value={stats?.avgScore ?? '—'} sub="All time" icon="📊" accent="var(--accent)" />
            <StatCard label="Best Score" value={stats?.bestScore ?? '—'} sub="Personal best" icon="🏆" accent="#22c55e" />
            <StatCard label="Sessions" value={stats?.totalSessions ?? '—'} sub="Total readings" icon="📡" />
            <StatCard label="Worst" value={stats?.worstScore ?? '—'} sub="Needs attention" icon="⚠️" accent="var(--orange)" />
          </div>
        </div>

        {/* ── Chart */}
        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <TrendingUp size={18} color="var(--accent)" />
              <h3 style={styles.chartTitle}>Real-Time Spine Curvature Graph</h3>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Last {MAX_POINTS} readings · Updates every ~2.5s</p>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="time" hide tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '12px', color: 'var(--text-muted)' }} />
              <ReferenceLine y={80} stroke="rgba(34,197,94,0.3)" strokeDasharray="4 4" label={{ value: 'Good', fill: '#22c55e', fontSize: 11 }} />
              <ReferenceLine y={50} stroke="rgba(249,115,22,0.3)" strokeDasharray="4 4" label={{ value: 'Poor', fill: '#f97316', fontSize: 11 }} />
              <Line
                type="monotone" dataKey="score" name="Posture Score"
                stroke="var(--accent)" strokeWidth={2.5} dot={false}
                activeDot={{ r: 5, fill: 'var(--accent)', stroke: 'var(--bg-dark)', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* ── Bottom row: Alerts + Info */}
        <div style={styles.bottomGrid}>
          {/* Alerts */}
          <div style={styles.alertCard}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Bell size={16} color="var(--accent)" />
              <h3 style={styles.chartTitle}>Recent Alerts</h3>
            </div>
            {alerts.length === 0
              ? <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No alerts yet. Great posture! 🎉</p>
              : alerts.map(a => (
                <div key={a.id} style={{ ...styles.alertItem, borderLeftColor: a.color }}>
                  <p style={{ fontSize: '13px', color: 'var(--text)' }}>{a.msg}</p>
                </div>
              ))
            }
          </div>

          {/* Info panel */}
          <div style={styles.infoCard}>
            <h3 style={{ ...styles.chartTitle, marginBottom: '14px' }}>🦴 About Your Spine</h3>
            {[
              { title: 'Sciatica Risk', body: 'Poor posture sustained over time can cause disc compression, leading to sciatica — pain radiating from lower back to legs.' },
              { title: 'Forward Head', body: 'Every inch of head-forward shift adds ~10 lbs of load on cervical spine. Keep ears aligned with shoulders.' },
              { title: 'Sway Back', body: 'Rounded shoulders + sway back increases lumbar curvature. Core strengthening and conscious sitting help.' }
            ].map(item => (
              <div key={item.title} style={styles.infoItem}>
                <p style={{ fontSize: '13px', fontWeight: '700', color: 'var(--accent)', marginBottom: '4px' }}>{item.title}</p>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {showCalib && <CalibrationModal onDone={handleCalibDone} onClose={() => setShowCalib(false)} />}
    </div>
  );
}

function getStatusFromScore(score) {
  if (score >= 85) return 'Excellent';
  if (score >= 65) return 'Good';
  if (score >= 40) return 'Poor – Forward Head';
  return 'Critical – Slouching';
}

const styles = {
  root: { minHeight: '100vh', background: 'var(--bg-dark)', display: 'flex', flexDirection: 'column' },
  nav: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '0 28px', height: '60px',
    background: 'var(--bg-card)', borderBottom: '1px solid var(--border)',
    position: 'sticky', top: 0, zIndex: 100
  },
  navBrand: { display: 'flex', alignItems: 'center', gap: '10px' },
  navTitle: { fontFamily: 'var(--font-mono)', fontSize: '18px', fontWeight: '700' },
  navRight: { display: 'flex', alignItems: 'center', gap: '12px' },
  liveChip: {
    display: 'flex', alignItems: 'center', gap: '5px',
    padding: '4px 10px', borderRadius: '999px',
    background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
    fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: '700', letterSpacing: '0.5px'
  },
  navBtn: {
    background: 'none', border: 'none', color: 'var(--text-muted)',
    cursor: 'pointer', padding: '6px', borderRadius: '8px',
    display: 'flex', alignItems: 'center',
    transition: 'color 0.2s'
  },
  avatar: {
    width: '32px', height: '32px', borderRadius: '50%',
    background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'var(--font-mono)', fontWeight: '700', fontSize: '14px', color: '#fff'
  },
  main: { padding: '28px', maxWidth: '1200px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' },
  welcomeRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' },
  welcomeTitle: { fontFamily: 'var(--font-mono)', fontSize: '22px', fontWeight: '700' },
  welcomeSub: { fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' },
  inlineLink: { background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '14px', textDecoration: 'underline' },
  topGrid: { display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '20px', alignItems: 'start' },
  gaugeCard: {
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: '20px', padding: '28px 32px',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px',
    minWidth: '220px'
  },
  cardLabel: { fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', letterSpacing: '1px' },
  adviceText: { fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', maxWidth: '180px', lineHeight: 1.5 },
  statsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' },
  chartCard: {
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: '20px', padding: '24px 28px'
  },
  chartHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '8px' },
  chartTitle: { fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: '700', color: 'var(--text)' },
  bottomGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
  alertCard: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '24px' },
  alertItem: {
    padding: '10px 12px', borderLeft: '3px solid var(--red)',
    background: 'rgba(255,255,255,0.02)', borderRadius: '0 8px 8px 0',
    marginBottom: '8px'
  },
  infoCard: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '24px' },
  infoItem: {
    padding: '12px 0', borderBottom: '1px solid var(--border)'
  }
};
