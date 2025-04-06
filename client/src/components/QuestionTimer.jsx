import { useEffect, useState } from 'react';
import './QuestionTimer.css';

export default function QuestionTimer({ 
  initialTime = 10, 
  onTimeout 
}) {
  const [timeLeft, setTimeLeft] = useState(initialTime);

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeout();
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, onTimeout]);

  return (
    <div className="timer-container">
      <div 
        className="timer-bar" 
        style={{ width: `${(timeLeft / initialTime) * 100}%` }}
      ></div>
      <span className="timer-text">{timeLeft}s</span>
    </div>
  );
}