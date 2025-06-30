import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Define the types for our data structure
interface Option {
  id: number;
  option_text: string;
}

interface Question {
  id: number;
  question_text: string;
  options: Option[];
}

const Questionnaire: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch('/api/questions');
        if (!response.ok) {
          throw new Error('Failed to fetch questions');
        }
        const data: Question[] = await response.json();
        setQuestions(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  const handleOptionClick = async (optionId: number) => {
    const moveToNext = () => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        navigate('/results');
      }
    };

    // 1. Get user's location
    navigator.geolocation.getCurrentPosition(
      // Success callback
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // 2. Submit vote to the API endpoint
          await fetch('/api/answers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ optionId, latitude, longitude }),
          });
        } catch (err) {
          console.error('Failed to submit answer:', err);
          // We can still proceed to the next question even if the vote fails
        } finally {
          moveToNext();
        }
      },
      // Error callback
      (error) => {
        console.error('Could not get location, proceeding without answer.', error);
        // If we can't get location, we can't submit the vote.
        // Just move to the next question or results page.
        moveToNext();
      }
    );
  };

  if (isLoading) return <div className="text-center p-10">Loading questions...</div>;
  if (error) return <div className="text-center p-10 text-red-500">Error: {error}</div>;
  if (questions.length === 0) return <div className="text-center p-10">No questions available.</div>;

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-2xl text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">{currentQuestion.question_text}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentQuestion.options.map((option) => (
            <button key={option.id} onClick={() => handleOptionClick(option.id)} className="bg-gray-800 hover:bg-blue-600 text-white font-semibold py-4 px-6 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105">
              {option.option_text}
            </button>
          ))}
        </div>
        <p className="mt-8 text-gray-400">Question {currentQuestionIndex + 1} of {questions.length}</p>
      </div>
    </div>
  );
};

export default Questionnaire;