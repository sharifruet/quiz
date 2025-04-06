const express = require('express');
const cors = require('cors');
const socketio = require('socket.io');
const db = require('./models');
const quizRoutes = require('./routes/quiz');
const gameRoutes = require('./routes/game');

// Initialize Express
const app = express();

// Configure CORS for REST API
app.use(cors({
  origin: 'http://localhost:3000', // Your React app's URL
  credentials: true
}));

app.use(express.json());

// Database Sync
db.sequelize.sync({ alter: true })
  .then(() => console.log('✅ Database synced'))
  .catch(err => console.error('❌ Database sync error:', err));

// Routes
app.use('/api/quizzes', quizRoutes);
app.use('/api/game', gameRoutes);

// Start Server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// Socket.io CORS setup
const io = socketio(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true
  }
});

// Socket.io Events
io.on('connection', (socket) => {
  console.log('🔌 New client connected:', socket.id);

  socket.on('join-game', async (pin) => {
    const session = await db.GameSession.findOne({ where: { pin } });
    if (!session) return socket.emit('error', 'Invalid PIN');
    
    socket.join(pin);
    socket.emit('game-joined', { quizId: session.quizId });
  });

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});