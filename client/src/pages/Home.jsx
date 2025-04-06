import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import './Home.css';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <div className="home-content">
        <Logo />
        <p className="home-subtitle">Create or join exciting quizzes in real-time!</p>
        
        <div className="button-group">
          <button onClick={() => navigate('/host')}>Host a Quiz</button>
          <button onClick={() => navigate('/join')}>Join a Game</button>
        </div>
      </div>
    </div>
  );
}