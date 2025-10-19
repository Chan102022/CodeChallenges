const express = require('express');
const router = express.Router();
const Leaderboard = require('../models/Leaderboard');
const authMiddleware = require('../middleware/authMiddleware');

// POST: Submit score
router.post('/submit', authMiddleware, async (req, res) => {
  const { category, score } = req.body;

  await Leaderboard.create({
    username: req.user.username,
    category,
    score,
  });

  res.json({ message: 'Score submitted' });
});

// GET: Top 10 players per category
router.get('/:category', async (req, res) => {
  const { category } = req.params;

  const topPlayers = await Leaderboard.find({ category })
    .sort({ score: -1 })
    .limit(10);

  res.json(topPlayers);
});

module.exports = router;
