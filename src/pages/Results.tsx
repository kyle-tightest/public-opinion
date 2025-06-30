import React, { useEffect, useState } from 'react';

interface Answer {
  id: number;
  question_id: number;
  answer_text: string;
  latitude: number;
  longitude: number;
  created_at: string;
}

interface Question {
  id: number;
  question_text: string;
}

const Results: React.FC = () => {
  const [proximityAnswers, setProximityAnswers] = useState<Answer[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [location, setLocation] = useState<{latitude: number; longitude: number} | null>(null);
  const [radius, setRadius] = useState<number>(10); // Default radius in km

  useEffect(() => {
    // Fetch questions to map question_id to question_text
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
          alert('Could not get your location. Please enable location services for this site to see proximity results.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  }, []);

  useEffect(() => {
    if (location) {
      fetchProximityAnswers();
    }
  }, [location, radius]);

  const fetchProximityAnswers = async () => {
    if (!location) return;
    try {
      const response = await fetch(`http://localhost:5000/answers/proximity?latitude=${location.latitude}&longitude=${location.longitude}&radius_km=${radius}`);
      const data = await response.json();
      setProximityAnswers(data);
    } catch (error) {
      console.error('Error fetching proximity answers:', error);
    }
  };

  const getQuestionText = (questionId: number) => {
    const question = questions.find(q => q.id === questionId);
    return question ? question.question_text : `Question ID: ${questionId}`;
  };

  return (
    <div className="flex flex-col items-center p-4 h-screen">
      <h1 className="text-4xl font-bold mb-8 text-blue-400 drop-shadow-[0_0_5px_rgba(66,153,225,0.8)]">
        Answers Near You
      </h1>

      <div className="mb-6 bg-gray-800 bg-opacity-70 p-6 rounded-lg shadow-lg border border-gray-700">
        <label htmlFor="radius" className="block text-lg font-semibold mb-2 text-gray-200">Search Radius (km):</label>
        <input
          type="range"
          id="radius"
          min="1"
          max="1000"
          value={radius}
          onChange={(e) => setRadius(parseFloat(e.target.value))}
          className="w-64 accent-blue-500"
        />
        <span className="ml-4 text-xl text-gray-200">{radius} km</span>
      </div>

      <button
        onClick={fetchProximityAnswers}
        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-lg hover:shadow-green-500/50 mb-8"
      >
        Refresh Results
      </button>

      {proximityAnswers.length === 0 ? (
        <p className="text-gray-300">No answers found near your location within the selected radius.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-4xl">
          {proximityAnswers.map((answer) => (
            <div key={answer.id} className="bg-gray-800 bg-opacity-70 p-6 rounded-lg shadow-lg border border-gray-700">
              <p className="text-lg font-semibold mb-2 text-blue-300">{getQuestionText(answer.question_id)}</p>
              <p className="text-md mb-2 text-gray-200">Answer: <span className="font-bold text-white">{answer.answer_text}</span></p>
              <p className="text-sm text-gray-400">Lat: {answer.latitude.toFixed(4)}, Lon: {answer.longitude.toFixed(4)}</p>
              <p className="text-sm text-gray-400">{new Date(answer.created_at).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Results;