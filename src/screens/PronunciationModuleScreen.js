import React from 'react';
import Icon from '../components/Icon';

/**
 * PronunciationModuleScreen Component
 * 
 * Lists all phrases in a lesson for pronunciation practice.
 * Users select a phrase to practice pronunciation.
 */
const PronunciationModuleScreen = ({ currentLesson, setCurrentScreen, setPronunciationPhrase }) => {
  if (!currentLesson) {
    return (
      <div className="min-h-screen bg-gray-100 pt-14 pb-16 md:pt-16 flex items-center justify-center">
        <p>No lesson selected. Go back to the lesson list.</p>
      </div>
    );
  }
  
  const phrases = currentLesson.phrases;

  const handlePhraseSelect = (phrase) => {
    setPronunciationPhrase(phrase);
    setCurrentScreen('pronunciation');
  };

  return (
    <div className="min-h-screen bg-gray-100 pt-14 pb-16 md:pt-16">
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{currentLesson.title}</h1>
        <p className="text-lg text-gray-600 mb-6">Pronunciation Practice</p>
        
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {phrases.map((phrase, index) => (
              <li key={index}>
                <button 
                  onClick={() => handlePhraseSelect(phrase)} 
                  className="w-full p-4 text-left hover:bg-gray-50 flex items-center justify-between"
                >
                  <div>
                    <p className="text-base font-semibold text-gray-900">{phrase.en}</p>
                    <p className="text-sm text-gray-600">{phrase.translation}</p>
                  </div>
                  <Icon name="mic" size={20} className="text-blue-600" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PronunciationModuleScreen;
