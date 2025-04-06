import './OptionButton.css';

export default function OptionButton({ 
  option, 
  index, 
  onClick, 
  isCorrect, 
  isSelected,
  showResult 
}) {
  const colors = ['#FF2D55', '#5856D6', '#FF9500', '#34C759'];
  const getButtonState = () => {
    if (!showResult) return '';
    return isCorrect ? 'correct' : isSelected ? 'wrong' : '';
  };

  return (
    <button
      className={`option-button ${getButtonState()}`}
      style={{ '--color': colors[index] }}
      onClick={onClick}
      disabled={showResult}
    >
      <span className="option-letter">
        {String.fromCharCode(65 + index)}
      </span>
      <span className="option-text">{option}</span>
    </button>
  );
}