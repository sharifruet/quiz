import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import HostQuiz from './pages/HostQuiz';
import GameLobby from './pages/GameLobby';
import PlayerJoin from './pages/PlayerJoin';
import GameScreen from './pages/GameScreen';
import './App.css'; // Basic styling

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          {/* Main Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/host" element={<HostQuiz />} />
          <Route path="/join" element={<PlayerJoin />} />

          {/* Game Flow Routes */}
          <Route path="/lobby/:quizId" element={<GameLobby />} />
          <Route path="/play/:playerId" element={<GameScreen />} />

          {/* Fallback Route */}
          <Route path="*" element={<h1>404 Not Found</h1>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;