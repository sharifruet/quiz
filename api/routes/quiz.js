const express = require('express');
const router = express.Router();
const { Quiz, Question } = require('../models');

// Create a quiz with questions
router.post('/', async (req, res) => {
  try {
    const { title, questions, createdBy } = req.body;

    // Create quiz
    const quiz = await Quiz.create({ title, createdBy });

    // Add questions
    for (const q of questions) {
      await Question.create({
        ...q,
        quizId: quiz.id
      });
    }

    res.status(201).json(quiz);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

// Get all quizzes
router.get('/', async (req, res) => {
  try {
    const quizzes = await Quiz.findAll({
      include: [{ model: Question }] // Include questions
    });
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;