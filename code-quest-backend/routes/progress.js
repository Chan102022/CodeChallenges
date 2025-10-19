const express = require('express');
const router = express.Router();
const Progress = require('../models/Progress');
const authMiddleware = require('../middleware/authMiddleware');

// GET user progress by category
router.get('/:category', authMiddleware, async (req, res) => {
  const { category } = req.params;
  const progress = await Progress.findOne({ userId: req.user.id, category });

  res.json({
    maxUnlockedLevel: progress ? progress.level : 1,
  });
});

// POST update progress after level complete
router.post('/update', authMiddleware, async (req, res) => {
  const { category, levelCompleted } = req.body;

  try {
    const existing = await Progress.findOne({ userId: req.user.id, category });

    if (!existing) {
      await Progress.create({
        userId: req.user.id,
        category,
        level: levelCompleted,
      });
    } else if (levelCompleted > existing.level) {
      existing.level = levelCompleted;
      await existing.save();
    }

    res.json({ message: 'Progress updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
