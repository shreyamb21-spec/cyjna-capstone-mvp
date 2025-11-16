/**
 * OnboardingStepTwoScreen Component
 * 
 * Second step of onboarding: Asks for learning level and goals.
 * Triggers learning plan generation on completion.
 * 
 * Props:
 * - onCompleteOnboarding: Callback with level and goals (function)
 */

import React, { useState } from 'react';

const OnboardingStepTwoScreen = ({ onCompleteOnboarding }) => {
  const [level, setLevel] = useState('');
  const [goals, setGoals] = useState([]);
  
  const levels = ['Beginner', 'Intermediate', 'Advanced'];
  const goalOptions = ['Travel', 'Work', 'Conversation', 'Culture', 'Exams'];

  const toggleGoal = (goal) => {
    setGoals(prev => 
      prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal]
    );
  };
  
  const canFinish = level && goals.length > 0;

  return (
    <div className="flex flex-col justify-center min-h-screen bg-gray-50 p-6">
      <div className="max-w-md mx-auto w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Almost there!</h1>
        <p className="text-gray-600 mb-8">Help us customize your learning plan.</p>

        <div className="space-y-6">
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">What's your current level?</label>
            <div className="flex flex-wrap gap-2">
              {levels.map(l => (
                <button
                  key={l}
                  onClick={() => setLevel(l)}
                  className={`px-4 py-2 rounded-full font-medium transition-colors ${
                    level === l ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">What are your goals?</label>
            <div className="flex flex-wrap gap-2">
              {goalOptions.map(g => (
                <button
                  key={g}
                  onClick={() => toggleGoal(g)}
                  className={`px-4 py-2 rounded-full font-medium transition-colors ${
                    goals.includes(g) ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={() => onCompleteOnboarding(level, goals)}
          className="w-full mt-10 px-6 py-3 bg-green-500 text-white text-lg font-semibold rounded-lg shadow-lg transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!canFinish}
        >
          Start Learning!
        </button>
      </div>
    </div>
  );
};

export default OnboardingStepTwoScreen;
