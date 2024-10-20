const express = require('express');
const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// Directory for saving quizzes
const QUIZ_DIR = path.join(__dirname, 'quizzes');

// Ensure quizzes directory exists
if (!fs.existsSync(QUIZ_DIR)) {
    fs.mkdirSync(QUIZ_DIR);
}

// POST /api/quiz - Create a new quiz
router.post('/quiz', async (req, res) => {
    const { name, topic } = req.body;

    if (!name || !topic) {
        return res.status(400).json({ error: 'Name and topic are required' });
    }

    const quizId = Math.floor(Math.random() * 10000000).toString().padStart(8, '0');

    try {
        console.log(`Requesting questions for topic: "${topic}"`);

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `Create 10 multiple-choice questions in json format with 3-4 options and an answer on the topic "${topic}".`;

        const result = await model.generateContent(prompt);

        // Extract the text response and clean it
        let questionsText = await result.response.text();
        questionsText = questionsText.replace(/```json/g, '').replace(/```/g, '').trim();

        // Parse the cleaned JSON response
        const quizData = { quizId, questions: JSON.parse(questionsText) };

        // Save the quiz data to /quizzes directory
        const quizFilePath = path.join(QUIZ_DIR, `quiz-${quizId}.json`);
        fs.writeFileSync(quizFilePath, JSON.stringify(quizData));

        res.json({ quizId });
    } catch (error) {
        console.error('Error generating questions:', error);
        res.status(500).json({ error: 'Failed to generate questions' });
    }
});

// GET /api/quiz - Get all quizzes
router.get('/quiz', (req, res) => {
    try {
        const quizFiles = fs.readdirSync(QUIZ_DIR);
        const quizzes = quizFiles.map(file => {
            const quizContent = fs.readFileSync(path.join(QUIZ_DIR, file));
            return JSON.parse(quizContent);
        });
        res.json(quizzes);
    } catch (error) {
        console.error('Error reading quizzes:', error);
        res.status(500).json({ error: 'Failed to fetch quizzes' });
    }
});

// GET /api/quiz/:quizId - Get a specific quiz by ID
router.get('/quiz/:quizId', (req, res) => {
    const { quizId } = req.params;
    const quizFilePath = path.join(QUIZ_DIR, `quiz-${quizId}.json`);

    if (!fs.existsSync(quizFilePath)) {
        return res.status(404).json({ error: 'Quiz not found' });
    }

    try {
        const quizData = fs.readFileSync(quizFilePath);
        res.json(JSON.parse(quizData));
    } catch (error) {
        console.error('Error reading quiz:', error);
        res.status(500).json({ error: 'Failed to fetch quiz' });
    }
});

module.exports = router;
