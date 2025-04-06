const express = require('express');
const router = express.Router();
const { GameSession, Player, Quiz } = require('../models');

// Start a new game session
router.post('/start', async (req, res) => {
  try {
    const { quizId } = req.body;
    const pin = Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit PIN
    
    const session = await GameSession.create({ quizId, pin });
    res.json({ pin: session.pin });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Player joins game
router.post('/join', async (req, res) => {
  try {
    const { pin, playerName } = req.body;
    const session = await GameSession.findOne({ where: { pin } });

    if (!session) return res.status(404).json({ error: 'Invalid PIN' });
    if (!session.isActive) return res.status(400).json({ error: 'Game has ended' });

    const player = await Player.create({ 
      name: playerName, 
      gameSessionId: session.id 
    });
    res.json({ playerId: player.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;