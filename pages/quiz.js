import { useRouter } from 'next/router'
import { useState } from 'react'

export default function Quiz() {
  const router = useRouter()
  const [quizId, setQuizId] = useState(null)

  const handleStartQuiz = () => {
    // Generate a random quiz ID (e.g. "abcx")
    const newQuizId = Math.random().toString(36).substring(2, 6)
    setQuizId(newQuizId)

    // Navigate to the quiz page for the new quiz ID
    router.push(`/quiz/${newQuizId}`)
  }

  return (
    <div>
      <h1>Welcome to the Quiz app!</h1>
      <button onClick={handleStartQuiz}>Start</button>
      {quizId && <p>Your quiz ID is: {quizId}</p>}
    </div>
  )
}
