/**
 * OnboardingScreen Component
 * 
 * First step of onboarding: Asks for native and target languages.
 * Saves preferences to localStorage.
 * 
 * Props:
 * - setCurrentScreen: Callback to navigate to next screen (function)
 */

import React, { useState } from 'react';

const OnboardingScreen = ({ setCurrentScreen }) => {
  const [nativeLanguage, setNativeLanguage] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('');

  const canContinue = nativeLanguage && targetLanguage;

  return (
    <div className="flex flex-col justify-center min-h-screen bg-gray-50 p-6">
      <div className="max-w-md mx-auto w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Welcome!</h1>
        <p className="text-gray-600 mb-8">Let's get you set up.</p>
        
        <div className="space-y-6">
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">What is your native language?</label>
            <input
              type="text"
              value={nativeLanguage}
              onChange={(e) => setNativeLanguage(e.target.value)}
              placeholder="e.g., English"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">What language do you want to learn?</label>
            <input
              type="text"
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value)}
              placeholder="e.g., Japanese"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <button
          onClick={() => {
            // Save to localStorage
            localStorage.setItem('userPrefs', JSON.stringify({ nativeLanguage, targetLanguage }));
            setCurrentScreen('onboarding-step-2');
          }}
          className="w-full mt-10 px-6 py-3 bg-blue-500 text-white text-lg font-semibold rounded-lg shadow-lg transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!canContinue}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default OnboardingScreen;
