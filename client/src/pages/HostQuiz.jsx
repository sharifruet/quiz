import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import './HostQuiz.css';

export default function HostQuiz() {
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState([{
    questionText: '', 
    options: ['', ''], 
    correctAnswer: 0,  // Changed from correctIndex
    timeLimit: 10      // Changed from time
  }]);
  const navigate = useNavigate();

  const addQuestion = () => {
    setQuestions([...questions, {
      questionText: '',
      options: ['', ''],
      correctAnswer: 0,
      timeLimit: 10
    }]);
  };

  const removeQuestion = (index) => {
    const newQuestions = [...questions];
    newQuestions.splice(index, 1);
    setQuestions(newQuestions);
  };

  const updateQuestionText = (index, text) => {
    const newQuestions = [...questions];
    newQuestions[index].questionText = text;
    setQuestions(newQuestions);
  };

  const updateOption = (qIndex, oIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[oIndex] = value;
    setQuestions(newQuestions);
  };

  const setCorrectAnswer = (qIndex, oIndex) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].correctAnswer = oIndex;
    setQuestions(newQuestions);
  };

  const updateTimeLimit = (index, time) => {
    const newQuestions = [...questions];
    newQuestions[index].timeLimit = time;
    setQuestions(newQuestions);
  };

  const addOption = (qIndex) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options.push('');
    setQuestions(newQuestions);
  };

  const removeOption = (qIndex, oIndex) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options.splice(oIndex, 1);
    
    if (newQuestions[qIndex].correctAnswer >= oIndex) {
      newQuestions[qIndex].correctAnswer = Math.max(0, newQuestions[qIndex].correctAnswer - 1);
    }
    
    setQuestions(newQuestions);
  };

  const handleSubmit = async () => {
    try {
      // Validate inputs
      if (!title.trim()) {
        alert('Please enter a quiz title');
        return;
      }
  
      if (questions.length === 0) {
        alert('Please add at least one question');
        return;
      }
  
      for (const q of questions) {
        if (!q.questionText.trim()) {
          alert('All questions must have text');
          return;
        }
        if (q.options.some(opt => !opt.trim())) {
          alert('All options must be filled');
          return;
        }
        if (q.options.length < 2) {
          alert('Each question needs at least 2 options');
          return;
        }
      }
  
      // Make API request
      const response = await api.post('/quizzes', {
        title,
        questions,
        createdBy: 'Host'
      });
      //console.log(response);
      // Handle the response format you provided
      if (!response || !response.data.id) {
        throw new Error('Invalid response from server');
      }
  
      // Navigate to lobby with the quiz ID
      navigate(`/lobby/${response.data.id}`);
      
    } catch (err) {
      console.error('Quiz creation error:', err);
      
      // Show detailed error message if available
      const errorMessage = err.response?.data?.message 
                         || err.message 
                         || 'Failed to create quiz';
      alert(errorMessage);
    }
  };

  return (
    <div className="host-quiz-container">
      <h2>Create New Quiz</h2>
      
      <div className="quiz-title">
        <label>Quiz Title:</label>
        <input 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter quiz title"
          required
        />
      </div>

      <div className="questions-list">
        {questions.map((q, qIndex) => (
          <div key={qIndex} className="question-card">
            <div className="question-header">
              <h3>Question {qIndex + 1}</h3>
              <button 
                onClick={() => removeQuestion(qIndex)}
                className="delete-btn"
              >
                Delete Question
              </button>
            </div>

            <div className="question-text">
              <label>Question Text:</label>
              <input
                value={q.questionText}
                onChange={(e) => updateQuestionText(qIndex, e.target.value)}
                placeholder="Enter your question"
                required
              />
            </div>

            <div className="options-list">
              <label>Options:</label>
              {q.options.map((option, oIndex) => (
                <div key={oIndex} className="option-item">
                  <input
                    type="radio"
                    name={`correct-answer-${qIndex}`}
                    checked={q.correctAnswer === oIndex}
                    onChange={() => setCorrectAnswer(qIndex, oIndex)}
                  />
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                    placeholder={`Option ${oIndex + 1}`}
                    required
                  />
                  {q.options.length > 2 && (
                    <button 
                      onClick={() => removeOption(qIndex, oIndex)}
                      className="remove-option-btn"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button 
                onClick={() => addOption(qIndex)}
                className="add-option-btn"
              >
                + Add Option
              </button>
            </div>

            <div className="time-limit">
              <label>Time Limit (seconds):</label>
              <input
                type="number"
                min="5"
                max="60"
                value={q.timeLimit}
                onChange={(e) => updateTimeLimit(qIndex, parseInt(e.target.value))}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="action-buttons">
        <button onClick={addQuestion} className="add-question-btn">
          + Add Question
        </button>
        <button onClick={handleSubmit} className="submit-quiz-btn">
          Create Quiz
        </button>
      </div>
    </div>
  );
}