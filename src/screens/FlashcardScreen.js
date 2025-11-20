import React, { useState } from 'react';
import { callGeminiTTS } from '../api/geminiApi';
import { base64ToArrayBuffer, pcmToWav } from '../utils/audioHelpers';
import Icon from '../components/Icon';

/**
 * FlashcardScreen Component
 * 
 * Displays flashcards for phrases in the current lesson.
 * Users can listen to pronunciations and navigate through phrases.
 */
const FlashcardScreen = ({ setCurrentScreen, setPronunciationPhrase, currentLesson }) => {
  const [currentPhrase, setCurrentPhrase] = useState(0);
  const [saved, setSaved] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [audioError, setAudioError] = useState(null);

  const phrases = currentLesson?.phrases && currentLesson.phrases.length > 0 ? currentLesson.phrases : [
    { id: 1, en: "No lesson selected.", translation: "请选择一个课程。", phonetic: "Qǐng xuǎnzé yīgè kèchéng.", category: "General", context: "Go back to the lessons list to select a lesson." },
  ];

  const phrase = phrases[currentPhrase] || phrases[0];
  const totalPhrases = phrases.length;

  const handleListen = async () => {
    if (isListening) return;
    setIsListening(true);
    setAudioError(null);
    try {
      const { audioData, sampleRate } = await callGeminiTTS(phrase.en);
      const pcmData = new Int16Array(base64ToArrayBuffer(audioData));
      const wavBlob = pcmToWav(pcmData, sampleRate);
      const audioUrl = URL.createObjectURL(wavBlob);
      
      const audio = new Audio(audioUrl);
      audio.play();
      
      audio.onended = () => {
        setIsListening(false);
        URL.revokeObjectURL(audioUrl);
      };
      audio.onerror = () => {
        setIsListening(false);
        setAudioError("Failed to play audio.");
        URL.revokeObjectURL(audioUrl);
      };
    } catch (error) {
      console.error("TTS failed:", error);
      if (error.message && (error.message.includes("401") || error.message.toLowerCase().includes("unauthorized"))) {
        setAudioError("Authentication failed (Error 401). This environment's API key is missing or invalid.");
      } else {
        setAudioError("Audio failed to load. Please try again.");
      }
      setIsListening(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 pt-14 pb-16 md:pt-16">
      <div className="max-w-2xl mx-auto p-4 md:p-6">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm text-gray-600">Phrase {currentPhrase + 1} of {totalPhrases}</span>
          <div className="flex gap-1">
            {Array.from({ length: totalPhrases }).map((_, i) => (
              <div key={i} className={`w-2 h-2 rounded-full ${i === currentPhrase ? 'bg-blue-600' : 'bg-gray-300'}`} />
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg mb-6">
          <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 text-sm font-semibold rounded-full mb-4">{phrase.category || 'Personalized'}</span>
          <div className="mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">{phrase.en}</h2>
            <p className="text-lg text-gray-600">{phrase.translation}</p>
            {phrase.phonetic && (
              <p className="text-lg text-blue-600 mt-1">{phrase.phonetic}</p>
            )}
          </div>
          <div className="bg-gray-50 rounded-lg p-4 mb-6 flex items-start gap-3">
            <Icon name="info" size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-700">{phrase.context}</p>
          </div>
          <button 
            onClick={handleListen} 
            disabled={isListening}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 mb-4 disabled:bg-blue-400"
          >
            {isListening ? (
              <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Icon name="volume" size={24} />
            )}
            <span>{isListening ? 'Loading...' : 'Listen'}</span>
          </button>
          {audioError && <p className="text-center text-red-500 text-sm mb-4">{audioError}</p>}
          <div className="space-y-3">
            <button onClick={() => setSaved(!saved)} className="w-full border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-semibold py-3 rounded-xl flex items-center justify-center gap-2">
              <Icon name="bookmark" size={20} />
              <span>{saved ? 'Saved' : 'Save for offline'}</span>
              {saved && <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">Offline</span>}
            </button>
            <button onClick={() => { setPronunciationPhrase(phrase); setCurrentScreen('pronunciation'); }} className="w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-3 rounded-xl flex items-center justify-center gap-2">
              <Icon name="mic" size={20} />
              <span>Practice pronunciation</span>
            </button>
          </div>
        </div>
        <div className="flex gap-4">
          <button onClick={() => setCurrentPhrase(Math.max(0, currentPhrase - 1))} disabled={currentPhrase === 0} className={`flex-1 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 ${currentPhrase === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
            <Icon name="chevron-left" size={20} />
            <span>Previous</span>
          </button>
          <button onClick={() => setCurrentPhrase(Math.min(totalPhrases - 1, currentPhrase + 1))} disabled={currentPhrase === totalPhrases - 1} className={`flex-1 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 ${currentPhrase === totalPhrases - 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
            <span>Next</span>
            <Icon name="chevron-right" size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FlashcardScreen;
