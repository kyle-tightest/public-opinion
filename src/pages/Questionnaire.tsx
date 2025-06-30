import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Question {
  id: number;
  question_text: string;
}

const Questionnaire: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<{[key: number]: string}>({});
  const [location, setLocation] = useState<{latitude: number; longitude: number} | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch questions
    fetch('http://localhost:5000/questions')
      .then(res => res.json())
      .then(data => setQuestions(data))
      .catch(err => console.error('Error fetching questions:', err));

    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Could not get your location. Please enable location services for this site.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  }, []);

  const handleAnswerChange = (questionId: number, answerText: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answerText }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!location) {
      alert('Location not available. Please enable location services.');
      return;
    }

    for (const question of questions) {
      const answerText = answers[question.id];
      if (!answerText) {
        alert(`Please answer all questions. Missing answer for: ${question.question_text}`);
        return;
      }

      try {
        await fetch('http://localhost:5000/answers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            question_id: question.id,
            answer_text: answerText,
            latitude: location.latitude,
            longitude: location.longitude,
          }),
        });
      } catch (error) {
        console.error('Error submitting answer:', error);
        alert('Failed to submit some answers. Please try again.');
        return;
      }
    }

    alert('Answers submitted successfully!');
    navigate('/results');
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen p-4">
      <h1 className="text-4xl font-bold mb-8 text-blue-400 drop-shadow-[0_0_5px_rgba(66,153,225,0.8)]">
        Answer the Questions
      </h1>
      <form onSubmit={handleSubmit} className="w-full max-w-2xl bg-gray-800 bg-opacity-70 p-8 rounded-lg shadow-lg border border-gray-700">
        {questions.length === 0 ? (
          <p className="text-gray-300">Loading questions...</p>
        ) : (
          questions.map((question) => (
            <div key={question.id} className="mb-6">
              <label className="block text-xl font-semibold mb-2 text-gray-200">{question.question_text}</label>
              <input
                type="text"
                className="w-full p-3 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:border-blue-500 text-white placeholder-gray-400"
                value={answers[question.id] || ''}
                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                required
              />
            </div>
          ))
        )}
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-lg hover:shadow-blue-500/50"
          disabled={!location || questions.length === 0}
        >
          Submit Answers
        </button>
      </form>
    </div>
  );
};

export default Questionnaire;