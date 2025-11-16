/**
 * PronunciationScreen Component
 * 
 * Modal for pronunciation practice. Displays a phrase and allows recording
 * with feedback simulation.
 * 
 * Props:
 * - phrase: Phrase to practice (string)
 * - language: Target language (string)
 * - onClose: Callback when closing modal (function)
 */

import React, { useState } from 'react';
import Icon from '../components/Icon';

const PronunciationScreen = ({ phrase, language, onClose }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState(null);

  const handleRecord = () => {
    if (isRecording) {
      // Stop recording
      setIsRecording(false);
      // Simulate API call and feedback
      setFeedback('Loading feedback...');
      setTimeout(() => {
        const randomScore = Math.floor(Math.random() * 30) + 70; // 70-100
        setScore(randomScore);
        if (randomScore > 90) {
          setFeedback('Excellent! Nailed it.');
        } else if (randomScore > 80) {
          setFeedback('Great job! Very close.');
        } else {
          setFeedback('Good try! Pay attention to the "R" sound.');
        }
      }, 2000);
    } else {
      // Start recording
      setIsRecording(true);
      setFeedback('');
      setScore(null);
    }
  };

  const getScoreColor = () => {
    if (!score) return 'text-gray-700';
    if (score > 90) return 'text-green-500';
    if (score > 80) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
          <Icon name="x" size={28} />
        </button>
        
        <h2 className="text-xl font-bold text-center text-gray-800 mb-2">Pronunciation Practice</h2>
        <p className="text-sm text-center text-gray-500 mb-6">Language: {language}</p>
        
        <div className="bg-gray-100 rounded-xl p-6 mb-6">
          <p className="text-3xl font-semibold text-center text-gray-900">{phrase}</p>
        </div>

        <div className="text-center mb-6">
          <button
            onClick={handleRecord}
            className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-lg transition-all ${
              isRecording ? 'bg-red-500 animate-pulse' : 'bg-blue-500'
            }`}
          >
            <Icon name="mic" size={32} className="text-white" />
          </button>
          <p className="mt-3 font-medium text-gray-700">
            {isRecording ? 'Recording...' : (feedback ? 'Tap to try again' : 'Tap to record')}
          </p>
        </div>

        {feedback && (
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            {score && (
              <p className={`text-5xl font-bold mb-2 ${getScoreColor()}`}>{score}%</p>
            )}
            <p className="text-lg text-gray-700">{feedback}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PronunciationScreen;
