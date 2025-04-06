import './PinDisplay.css';

export default function PinDisplay({ pin }) {
  return (
    <div className="pin-container">
      <h3>Game PIN:</h3>
      <div className="pin-digits">
        {pin.split('').map((digit, index) => (
          <span key={index} className="pin-digit">
            {digit}
          </span>
        ))}
      </div>
      <p>Share this PIN with players</p>
    </div>
  );
}