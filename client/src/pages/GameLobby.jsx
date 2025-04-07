import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api'; // Add this import
import socket from '../socket';
import PinDisplay from '../components/PinDisplay';
import PlayerList from '../components/PlayerList';
import Logo from '../components/Logo';

export default function GameLobby() {
  const { quizId } = useParams();
  const [pin, setPin] = useState('');
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    // Start game session
    api.post('/game/start', { quizId })  // Now using the imported 'api'
      .then(res => setPin(res.data.pin))
      .catch(err => console.error('Failed to start game:', err));

    // Socket.io listeners
    socket.on('player-joined', (player) => {
      setPlayers(prev => [...prev, player]);
    });

    return () => {
      socket.off('player-joined');
    };
  }, [quizId]);

  const startGame = () => {
    socket.emit('start-quiz', pin);
    // Navigate to question screen
  };

  return (
    <div className="game-lobby">
      <Logo/>
      <PinDisplay pin={pin} />
      <PlayerList players={players} />
      <button onClick={startGame}>Start Quiz</button>
    </div>
  );
}