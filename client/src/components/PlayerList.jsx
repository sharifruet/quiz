import './PlayerList.css';

export default function PlayerList({ players }) {
  return (
    <div className="player-list">
      <h4>Players ({players.length})</h4>
      <div className="player-avatars">
        {players.map(player => (
          <div key={player.id} className="player-badge">
            <div className="avatar">
              {player.name.charAt(0).toUpperCase()}
            </div>
            <span>{player.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}