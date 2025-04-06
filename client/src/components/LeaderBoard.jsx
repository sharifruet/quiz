import './Leaderboard.css';

export default function Leaderboard({ players }) {
  return (
    <div className="leaderboard">
      <h3>Leaderboard</h3>
      <ol>
        {players
          .sort((a, b) => b.score - a.score)
          .map((player, index) => (
            <li key={player.id}>
              <span className="rank">{index + 1}</span>
              <span className="name">{player.name}</span>
              <span className="score">{player.score} pts</span>
            </li>
          ))}
      </ol>
    </div>
  );
}