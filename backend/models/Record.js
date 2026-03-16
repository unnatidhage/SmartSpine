const mongoose = require('mongoose');

const recordSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  flexValue: { type: Number, required: true },       // raw sensor reading (0-1023)
  score: { type: Number, required: true },           // AI posture score 0-100
  status: { type: String, required: true },          // label
  alertSent: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now }
});

// Index for fast user queries
recordSchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model('Record', recordSchema);