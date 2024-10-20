const express = require('express');
const cors = require('cors');  // Import the CORS middleware
require('dotenv').config();
const quizRoutes = require('./quizRoutes');  // Import quiz routes

const app = express();
const port = 3000;

app.use(express.json());

// Enable CORS for all origins
app.use(cors());

// Use the quizRoutes for API endpoints
app.use('/api', quizRoutes);

app.listen(port, () => {
    console.log(`Quiz API listening on port ${port}`);
});
