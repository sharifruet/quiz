import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import api from '../api';
import socket from '../socket';
import './PlayerJoin.css'; // CSS import

export default function PlayerJoin() {
  const [pin, setPin] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const navigate = useNavigate();

  const handleJoin = async () => {
    if (!pin.trim() || !name.trim()) {
      setError('Please enter both PIN and name');
      return;
    }

    setIsJoining(true);
    setError('');

    try {
      const res = await api.post('/game/join', { pin, playerName: name });
      socket.emit('join-game', pin);
      navigate(`/play/${res.data.playerId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to join game');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="player-join-container">
      
      <div className="join-card">
        <Logo/>
        <h2 className="join-title">Enter Game PIN</h2>
        
        <div className="input-group">
          <input
            type="text"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="Game PIN"
            className="pin-input"
            maxLength={6}
          />
        </div>

        <div className="input-group">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="name-input"
            maxLength={20}
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <button
          onClick={handleJoin}
          className="join-button"
          disabled={isJoining}
        >
          {isJoining ? 'Joining...' : 'JOIN GAME'}
        </button>
      </div>
    </div>
  );
}