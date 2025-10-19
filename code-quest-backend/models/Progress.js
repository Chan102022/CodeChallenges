// models/Progress.js
const mongoose = require('mongoose');

const ProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, enum: ['Java', 'PHP'], required: true },
  level: { type: Number, default: 1 }, // Highest completed level
});

module.exports = mongoose.model('Progress', ProgressSchema);
