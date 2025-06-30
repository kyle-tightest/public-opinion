import React from 'react';

const Home: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen p-4">
      <h1 className="text-5xl font-bold mb-4 text-blue-400 drop-shadow-[0_0_5px_rgba(66,153,225,0.8)]">
        Public Opinion
      </h1>
      <p className="text-lg mb-8 text-gray-300">
        Answer questions and see what others think.
      </p>
      <a
        href="/questionnaire"
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-lg hover:shadow-blue-500/50"
      >
        Start Questionnaire
      </a>
    </div>
  );
};

export default Home;
