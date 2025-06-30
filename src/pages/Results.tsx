import React, { useEffect, useState } from 'react';

interface Answer {
  id: number;
  question_text: string;
  answer_text: string;
  latitude: number;
  longitude: number;
  created_at: string;
}

// New interface to hold the aggregated results
interface ProcessedResults {
  [questionText: string]: {
    totalVotes: number;
    options: {
      [optionText: string]: number;
    };
  };
}

const Results: React.FC = () => {
  const [proximityAnswers, setProximityAnswers] = useState<Answer[]>([]);
  const [processedResults, setProcessedResults] = useState<ProcessedResults>({});
  const [location, setLocation] = useState<{latitude: number; longitude: number} | null>(null);
  const [radius, setRadius] = useState<number>(10); // Default radius in km

  useEffect(() => {
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

  // This effect processes the raw answer data into aggregated results
  useEffect(() => {
    if (proximityAnswers.length > 0) {
      const results: ProcessedResults = proximityAnswers.reduce((acc, answer) => {
        const { question_text, answer_text } = answer;

        // Initialize the question object if it's the first time we see it
        if (!acc[question_text]) {
          acc[question_text] = {
            totalVotes: 0,
            options: {},
          };
        }

        // Initialize the option counter if it's the first time we see it
        if (!acc[question_text].options[answer_text]) {
          acc[question_text].options[answer_text] = 0;
        }

        // Increment the total and specific option counts
        acc[question_text].totalVotes += 1;
        acc[question_text].options[answer_text] += 1;

        return acc;
      }, {} as ProcessedResults);
      setProcessedResults(results);
    } else {
      setProcessedResults({}); // Clear results if no answers are found
    }
  }, [proximityAnswers]);

  const fetchProximityAnswers = async () => {
    if (!location) return;
    try {
      const response = await fetch(`/api/answers/proximity?latitude=${location.latitude}&longitude=${location.longitude}&radius_km=${radius}`);
      const data = await response.json();
      setProximityAnswers(data);
    } catch (error) {
      console.error('Error fetching proximity answers:', error);
    }
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

      {Object.keys(processedResults).length === 0 ? (
        <p className="text-gray-300">No answers found near your location within the selected radius.</p>
      ) : (
        <div className="space-y-8 w-full max-w-4xl">
          {Object.entries(processedResults).map(([question, data]) => (
            <div key={question} className="bg-gray-800 bg-opacity-70 p-6 rounded-lg shadow-lg border border-gray-700">
              <h2 className="text-xl font-semibold mb-2 text-blue-300">{question}</h2>
              <p className="text-sm text-gray-400 mb-4">Total Votes: {data.totalVotes}</p>
              <div className="space-y-3">
                {Object.entries(data.options)
                  .sort(([, countA], [, countB]) => countB - countA) // Sort by most popular
                  .map(([option, count]) => {
                  const percentage = ((count / data.totalVotes) * 100).toFixed(1);
                  return (
                    <div key={option}>
                      <div className="flex justify-between items-center mb-1 text-gray-200">
                        <span>{option}</span>
                        <span className="font-semibold">{percentage}% ({count})</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden"><div className="bg-blue-500 h-4 rounded-full transition-all duration-500" style={{ width: `${percentage}%` }} /></div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Results;
