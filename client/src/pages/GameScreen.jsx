import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import socket from '../socket';
import Leaderboard from '../components/Leaderboard';
import PlayerList from '../components/PlayerList';
import './GameScreen.css';
import Logo from '../components/Logo';

export default function GameScreen() {
  const { playerId } = useParams();
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [players, setPlayers] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [gameState, setGameState] = useState('waiting'); // waiting/playing/ended
  const [countdown, setCountdown] = useState(5);

  // Pre-game content
  const tips = [
    "Answer quickly for bonus points!",
    "The faster you answer, the more points you get",
    "Watch the leaderboard to track your position",
    "Get ready for some fun questions!"
  ];
  const [currentTip, setCurrentTip] = useState(0);

  useEffect(() => {
    // Rotate tips every 3 seconds
    const tipInterval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % tips.length);
    }, 3000);

    // Socket listeners
    socket.on('next-question', (question) => {
      setGameState('playing');
      setCurrentQuestion(question);
      setSelectedAnswer(null);
      setShowResult(false);
    });

    socket.on('player-joined', (updatedPlayers) => {
      setPlayers(updatedPlayers);
    });

    socket.on('game-starting', (seconds) => {
      setGameState('starting');
      setCountdown(seconds);
    });

    socket.on('game-ended', () => {
      setGameState('ended');
    });

    return () => {
      clearInterval(tipInterval);
      socket.off('next-question');
      socket.off('player-joined');
      socket.off('game-starting');
      socket.off('game-ended');
    };
  }, []);

  // Countdown effect
  useEffect(() => {
    if (gameState === 'starting' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown, gameState]);

  const submitAnswer = (answerIndex) => {
    setSelectedAnswer(answerIndex);
    socket.emit('submit-answer', {
      playerId,
      questionId: currentQuestion.id,
      answer: answerIndex
    });
  };

  return (
    <div className="game-screen">
      <Logo/>
      {gameState === 'waiting' && (
        <div className="waiting-screen">
          <h2>Game Will Start Soon!</h2>
          <div className="waiting-tip">
            <p>💡 {tips[currentTip]}</p>
          </div>
          <PlayerList players={players} />
          <Leaderboard players={players} />
        </div>
      )}

      {gameState === 'starting' && (
        <div className="countdown-screen">
          <div className="countdown-circle">
            <h1>{countdown}</h1>
          </div>
          <p>Get ready to play!</p>
        </div>
      )}

      {gameState === 'playing' && currentQuestion && (
        <div className="question-screen">
          <div className="question-header">
            <h3>Question</h3>
            <div className="question-text">{currentQuestion.questionText}</div>
          </div>

          <div className="options-grid">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                className={`option-button ${selectedAnswer === index ? 'selected' : ''} ${showResult && index === currentQuestion.correctAnswer ? 'correct' : ''} ${showResult && selectedAnswer === index && selectedAnswer !== currentQuestion.correctAnswer ? 'wrong' : ''}`}
                onClick={() => !showResult && submitAnswer(index)}
                disabled={showResult}
              >
                <span className="option-letter">
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="option-text">{option}</span>
              </button>
            ))}
          </div>

          <Leaderboard players={players} />
        </div>
      )}

      {gameState === 'ended' && (
        <div className="ended-screen">
          <h2>Game Over!</h2>
          <Leaderboard players={players} />
          <button className="play-again-btn">Return to Lobby</button>
        </div>
      )}
    </div>
  );
}