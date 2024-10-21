const express = require('express');
const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// Directory for saving quizzes and hosted quizzes
const QUIZ_DIR = path.join(__dirname, 'quizzes');
const HOSTED_QUIZ_DIR = path.join(__dirname, 'executions');

// Ensure necessary directories exist
if (!fs.existsSync(QUIZ_DIR)) fs.mkdirSync(QUIZ_DIR);
if (!fs.existsSync(HOSTED_QUIZ_DIR)) fs.mkdirSync(HOSTED_QUIZ_DIR);

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

        // Extract and clean the response
        let questionsText = await result.response.text();
        questionsText = questionsText.replace(/```json/g, '').replace(/```/g, '').trim();

        const quizData = { quizId, questions: JSON.parse(questionsText) };

        // Save the quiz
        const quizFilePath = path.join(QUIZ_DIR, `quiz-${quizId}.json`);
        fs.writeFileSync(quizFilePath, JSON.stringify(quizData));

        res.json({ quizId });
    } catch (error) {
        console.error('Error generating questions:', error);
        res.status(500).json({ error: 'Failed to generate questions' });
    }
});

// GET /api/quiz - Fetch all quizzes
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

// GET /api/quiz/{quizId} - Fetch a specific quiz by quizId
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

// POST /api/exec - Host (execute) a quiz
router.get('/quiz/:quizId/exec', (req, res) => {
    const { quizId } = req.params;
    const execId = Math.floor(Math.random() * 10000000).toString().padStart(8, '0');
    const startTime = new Date();
    const endTime = null;

    const hostData = {
        execId,
        quizId,
        startTime,
        endTime,
        currentQuestionIndex: 0,  // Start from the first question
        status: 'created',        // pending, started, completed
        participants: [],         // List of participants and their answers
        questionStartTime: null   // Start time of the current question
    };

    const hostFilePath = path.join(HOSTED_QUIZ_DIR, `host-${execId}.json`);
    fs.writeFileSync(hostFilePath, JSON.stringify(hostData));

    res.json({ execId });
});

// GET /exec/{execId}/start - Change status to 'started' and return quiz questions
router.get('/exec/:execId/start', (req, res) => {
    const { execId } = req.params;
    const hostFilePath = path.join(HOSTED_QUIZ_DIR, `host-${execId}.json`);

    if (!fs.existsSync(hostFilePath)) {
        return res.status(404).json({ error: 'Quiz execution not found' });
    }

    try {
        // Load the hosted quiz data
        const hostData = JSON.parse(fs.readFileSync(hostFilePath));

        // Check if the quiz execution is already started or completed
        if (hostData.status === 'started') {
            return res.status(400).json({ error: 'Quiz execution has already started' });
        } else if (hostData.status === 'completed') {
            return res.status(400).json({ error: 'Quiz execution has already been completed' });
        }

        // Load the associated quiz using the quizId from the hosted quiz data
        const quizFilePath = path.join(QUIZ_DIR, `quiz-${hostData.quizId}.json`);
        if (!fs.existsSync(quizFilePath)) {
            return res.status(404).json({ error: 'Quiz not found' });
        }

        const quizData = JSON.parse(fs.readFileSync(quizFilePath));

        // Update the status to 'started' and save the hosted quiz data
        hostData.status = 'started';
        fs.writeFileSync(hostFilePath, JSON.stringify(hostData));

        // Return the quiz questions
        res.json({ status: 'started', questions: quizData.questions });
    } catch (error) {
        console.error('Error starting the quiz execution:', error);
        res.status(500).json({ error: 'Failed to start quiz execution' });
    }
});

// POST /quiz/{execId}/participant/{participantId} - Add participant answer for a single question
router.post('/quiz/:execId/participant/:participantId', (req, res) => {
    const { execId, participantId } = req.params;
    const { questionId, answer } = req.body;

    if (!questionId || !answer) {
        return res.status(400).json({ error: 'Question ID and answer are required' });
    }

    const hostFilePath = path.join(HOSTED_QUIZ_DIR, `host-${execId}.json`);

    if (!fs.existsSync(hostFilePath)) {
        return res.status(404).json({ error: 'Quiz execution not found' });
    }

    try {
        const hostData = JSON.parse(fs.readFileSync(hostFilePath));

        // Check if the answer is within the 10-second time window for the current question
        const questionTimeElapsed = (new Date().getTime() - new Date(hostData.questionStartTime).getTime()) / 1000;
        if (questionTimeElapsed > 10) {
            return res.status(400).json({ error: 'Time for answering the question has expired' });
        }

        // Find or add participant
        let participant = hostData.participants.find(p => p.participantId === participantId);
        if (!participant) {
            participant = { participantId, answers: [] };
            hostData.participants.push(participant);
        }

        // Add answer for the current question
        participant.answers.push({
            questionId,
            answer,
            answerTime: new Date().toISOString()
        });

        // Save the updated hosted quiz data
        fs.writeFileSync(hostFilePath, JSON.stringify(hostData));

        res.json({ message: 'Answer submitted successfully' });
    } catch (error) {
        console.error('Error adding participant answer:', error);
        res.status(500).json({ error: 'Failed to submit answer' });
    }
});

// GET /exec/{execId}/question/{questionId} - Get a specific question (open for 10 seconds)
router.get('/exec/:execId/question/:questionId', (req, res) => {
    const { execId, questionId } = req.params;
    const hostFilePath = path.join(HOSTED_QUIZ_DIR, `host-${execId}.json`);

    if (!fs.existsSync(hostFilePath)) {
        return res.status(404).json({ error: 'Quiz execution not found' });
    }

    try {
        const hostData = JSON.parse(fs.readFileSync(hostFilePath));
        const quizFilePath = path.join(QUIZ_DIR, `quiz-${hostData.quizId}.json`);
        const quizData = JSON.parse(fs.readFileSync(quizFilePath));

        // Validate questionId
        const question = quizData.questions[questionId - 1];
        if (!question) {
            return res.status(404).json({ error: 'Question not found' });
        }

        // Mark the start time for this question
        hostData.currentQuestionIndex = questionId - 1;
        hostData.questionStartTime = new Date().toISOString();

        // Save updated quiz execution data
        fs.writeFileSync(hostFilePath, JSON.stringify(hostData));

        // Return the question
        res.json({ question });
    } catch (error) {
        console.error('Error fetching question:', error);
        res.status(500).json({ error: 'Failed to fetch question' });
    }
});

// GET /api/exec/{execId} - Get a specific hosted quiz (with participants)
router.get('/exec/:execId', (req, res) => {
    const { execId } = req.params;
    const hostFilePath = path.join(HOSTED_QUIZ_DIR, `host-${execId}.json`);

    if (!fs.existsSync(hostFilePath)) {
        return res.status(404).json({ error: 'Quiz execution not found' });
    }

    try {
        const hostData = fs.readFileSync(hostFilePath);
        res.json(JSON.parse(hostData));
    } catch (error) {
        console.error('Error fetching hosted quiz:', error);
        res.status(500).json({ error: 'Failed to fetch hosted quiz' });
    }
});

module.exports = router;
