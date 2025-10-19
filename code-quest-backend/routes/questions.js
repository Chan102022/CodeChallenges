const express = require('express');
const router = express.Router();

// Dummy question data or logic
const questions = [
  { id: 1, question: "What is JavaScript?" },
  { id: 2, question: "What is Node.js?" },
  { id: 3, question: "What is Express?" },
];

// Get all questions
router.get('/', (req, res) => {
  res.json(questions);
});

// Get question by ID
router.get('/:id', (req, res) => {
  const question = questions.find(q => q.id === parseInt(req.params.id));
  if (!question) {
    return res.status(404).json({ message: 'Question not found' });
  }
  res.json(question);
});

// Add a new question
router.post('/', (req, res) => {
  const { question } = req.body;
  const newQuestion = {
    id: questions.length + 1,
    question,
  };
  questions.push(newQuestion);
  res.status(201).json(newQuestion);
});

// Update an existing question
router.put('/:id', (req, res) => {
  const question = questions.find(q => q.id === parseInt(req.params.id));
  if (!question) {
    return res.status(404).json({ message: 'Question not found' });
  }
  question.question = req.body.question;
  res.json(question);
});

// Delete a question
router.delete('/:id', (req, res) => {
  const index = questions.findIndex(q => q.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ message: 'Question not found' });
  }
  questions.splice(index, 1);
  res.json({ message: 'Question deleted' });
});

module.exports = router;
