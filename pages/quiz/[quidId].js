import { useRouter } from 'next/router';
import QRCode from 'qrcode.react';
import axios from 'axios';
import { useState, useEffect } from 'react';
import styles from './styles.module.css';

const QuizPage = () => {
  const router = useRouter();
  const { quizId } = router.query;
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState([]);
  const [showDummyText, setShowDummyText] = useState(false);
  const [timer, setTimer] = useState(15);

  // Generate the QR code data for the quiz URL
  const quizUrl = `https://example.com/participate/${quizId}`;
  const qrCodeData = JSON.stringify({
    type: 'quiz',
    quizId: quizId,
    quizUrl: quizUrl,
  });

  useEffect(() => {
    // Fetch the questions.json file and parse it as JSON
    fetch('/questions.json')
      .then((response) => response.json())
      .then((data) => {
        // Select a random question from the questions array
        const randomQuestion = data[Math.floor(Math.random() * data.length)];
        setQuestion(randomQuestion.question);
        setOptions(randomQuestion.options);
      })
      .catch((error) => console.error(error));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prevTimer) => prevTimer - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (timer === 0) {
      setShowDummyText(true);
      
      setTimer(10);
      setTimeout(() => {
        fetch('/questions.json')
          .then((response) => response.json())
          .then((data) => {
            // Select a random question from the questions array
            const randomQuestion = data[Math.floor(Math.random() * data.length)];
            setQuestion(randomQuestion.question);
            setOptions(randomQuestion.options);

            setTimer(15);
            setShowDummyText(false);

          })
          .catch((error) => console.error(error));
      }, 10000);
    }
  }, [timer]);

  return (
    <div>
      <h1>Quiz {quizId}</h1>
      <p>Scan the QR code to access the quiz:</p>
      <QRCode value={qrCodeData} />
      {showDummyText ? (
        <p>Dummy Text</p>
      ) : (
        <div>
          <p>{question}</p>
          <ul className={styles.options}>
            {options.map((option, index) => (
              <li key={index}>
                <label>
                  <input type="radio" name="options" value={option} />
                  {option}
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className={styles.progress}>
        XX<div className={styles.progressBar} style={{ width: `${(timer / 15) * 100}%` }} />
      </div>
    </div>
  );
};

export default QuizPage;
