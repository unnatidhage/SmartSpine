const express = require('express');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Get profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Set calibration value (good posture baseline)
router.post('/calibrate', authMiddleware, async (req, res) => {
  try {
    const { flexValue } = req.body;
    if (flexValue === undefined) return res.status(400).json({ error: 'flexValue required' });

    const user = await User.findByIdAndUpdate(
      req.userId,
      { calibrationValue: flexValue, isCalibrated: true },
      { new: true }
    ).select('-password');

    res.json({ message: 'Calibration saved!', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;