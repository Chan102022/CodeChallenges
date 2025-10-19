// models/Leaderboard.js
const mongoose = require('mongoose');

const LeaderboardSchema = new mongoose.Schema({
  username: String,
  category: { type: String, enum: ['Java', 'PHP'] },
  score: Number,
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Leaderboard', LeaderboardSchema);
