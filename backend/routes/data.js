const express = require('express');
const User = require('../models/User');
const Record = require('../models/Record');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// ─── AI POSTURE ANALYSIS ENGINE ────────────────────────────────────────────
// AI Integration Point #1: Rule-based engine (swap with ML model later)
// This function can be replaced with:
//   - A TensorFlow.js model trained on labeled posture data
//   - An OpenAI/Claude API call for richer contextual feedback
//   - A Python ML microservice (scikit-learn, PyTorch) via HTTP
const analyzePosture = (flexValue, calibrationValue) => {
  const diff = Math.abs(flexValue - calibrationValue);
  const deviation = (diff / calibrationValue) * 100;

  if (diff < 20) {
    return {
      label: 'Excellent',
      score: Math.round(95 - deviation * 0.1),
      advice: 'Great posture! Keep it up.',
      riskLevel: 'low',
      color: '#22c55e'
    };
  } else if (diff < 50) {
    return {
      label: 'Good',
      score: Math.round(80 - deviation * 0.2),
      advice: 'Minor curvature detected. Try to sit upright.',
      riskLevel: 'medium',
      color: '#f59e0b'
    };
  } else if (diff < 100) {
    return {
      label: 'Poor – Forward Head',
      score: Math.round(55 - deviation * 0.1),
      advice: 'Forward head posture detected. Roll shoulders back.',
      riskLevel: 'high',
      color: '#f97316'
    };
  } else {
    return {
      label: 'Critical – Slouching',
      score: Math.max(10, Math.round(30 - deviation * 0.05)),
      advice: 'Severe slouching! Risk of sciatica. Stand or adjust immediately.',
      riskLevel: 'critical',
      color: '#ef4444'
    };
  }
};

// ─── INGEST SENSOR DATA (ESP32 / Arduino POST here) ────────────────────────
// ESP32 endpoint: POST /api/data/ingest
// Body: { userId, flexValue, deviceId? }
router.post('/ingest', async (req, res) => {
  try {
    const { userId, flexValue, deviceId } = req.body;
    if (!userId || flexValue === undefined)
      return res.status(400).json({ error: 'userId and flexValue required' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const aiResult = analyzePosture(flexValue, user.calibrationValue);

    const record = new Record({
      userId,
      flexValue,
      score: aiResult.score,
      status: aiResult.label
    });
    await record.save();

    // AI Integration Point #2: Real-time WebSocket push to dashboard
    const io = req.app.get('io');
    io.emit(`posture:${userId}`, {
      flexValue,
      score: aiResult.score,
      status: aiResult.label,
      advice: aiResult.advice,
      riskLevel: aiResult.riskLevel,
      timestamp: record.timestamp
    });

    res.json({ success: true, record, analysis: aiResult });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET HISTORY (protected) ────────────────────────────────────────────────
router.get('/history/:userId', authMiddleware, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const records = await Record.find({ userId: req.params.userId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();
    res.json(records.reverse()); // oldest first for chart
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET STATS SUMMARY ──────────────────────────────────────────────────────
router.get('/stats/:userId', authMiddleware, async (req, res) => {
  try {
    const records = await Record.find({ userId: req.params.userId }).lean();
    if (!records.length) return res.json({ avgScore: 0, totalSessions: 0, bestScore: 0, worstScore: 0 });

    const scores = records.map(r => r.score);
    const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const bestScore = Math.max(...scores);
    const worstScore = Math.min(...scores);

    // Status distribution for AI Integration Point #3 (trend analysis)
    const distribution = records.reduce((acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    }, {});

    res.json({
      avgScore,
      totalSessions: records.length,
      bestScore,
      worstScore,
      distribution
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
