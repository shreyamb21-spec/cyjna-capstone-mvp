/**
 * FlashcardScreen Component
 * 
 * Displays flashcards generated from completed lessons.
 * Users can flip cards and navigate through them.
 * Requires completed lessons to generate flashcards.
 * 
 * Props:
 * - recentActivity: Object mapping lesson IDs to activity data
 * - setCurrentScreen: Callback to navigate screens
 * - completedLessonIds: Array of completed lesson IDs
 */

import React, { useState, useEffect } from 'react';
import LoadingScreen from '../components/LoadingScreen';
import { fetchFlashcards } from '../api/geminiApi';

const FlashcardScreen = ({ recentActivity, setCurrentScreen, completedLessonIds }) => {
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const { nativeLanguage, targetLanguage } = JSON.parse(localStorage.getItem('userPrefs'));

  const completedLessonData = Object.keys(recentActivity)
    .filter(lessonId => completedLessonIds.includes(lessonId))
    .map(lessonId => recentActivity[lessonId]);

  useEffect(() => {
    if (completedLessonData.length === 0) {
      setLoading(false);
      setError("Complete some lessons to generate flashcards.");
      return;
    }

    const fetchCards = async () => {
      setLoading(true);
      setError(null);
      try {
        const cards = await fetchFlashcards(completedLessonData, nativeLanguage, targetLanguage);
        if (cards.length === 0) {
          setError("No flashcards generated. Try completing more lessons.");
        } else {
          setFlashcards(cards);
        }
      } catch (err) {
        console.error("Error fetching flashcards:", err);
        setError("Failed to load flashcards.");
      }
      setLoading(false);
    };

    fetchCards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completedLessonIds.length]);

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex(prev => (prev + 1) % flashcards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex(prev => (prev - 1 + flashcards.length) % flashcards.length);
  };

  if (loading) return <LoadingScreen message="Generating flashcards..." />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-6 h-full text-center">
        <p className="text-lg text-gray-600">{error}</p>
        <button onClick={() => setCurrentScreen('home')} className="mt-4 text-blue-500 font-medium">
          Back to Home
        </button>
      </div>
    );
  }

  const currentCard = flashcards[currentIndex];

  return (
    <div className="p-4 md:p-6 flex flex-col items-center justify-center h-full bg-gray-50">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Flashcards</h1>
      
      {/* Flashcard */}
      <div
        className="w-full max-w-md h-64 perspective"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div
          className={`relative w-full h-full transform-style-preserve-3d transition-transform duration-500 ${isFlipped ? 'rotate-y-180' : ''}`}
        >
          {/* Front */}
          <div className="absolute w-full h-full backface-hidden bg-white rounded-xl shadow-lg flex items-center justify-center p-4">
            <p className="text-3xl font-bold text-gray-800 text-center">{currentCard.front}</p>
          </div>
          {/* Back */}
          <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-blue-500 rounded-xl shadow-lg flex items-center justify-center p-4">
            <p className="text-3xl font-bold text-white text-center">{currentCard.back}</p>
          </div>
        </div>
      </div>

      <p className="text-gray-600 mt-4">Tap card to flip</p>

      {/* Navigation */}
      <div className="flex items-center justify-between w-full max-w-md mt-6">
        <button
          onClick={handlePrev}
          className="px-6 py-3 bg-white text-gray-700 font-semibold rounded-lg shadow-md transition-transform hover:scale-105"
        >
          Prev
        </button>
        <span className="text-gray-700 font-medium">
          {currentIndex + 1} / {flashcards.length}
        </span>
        <button
          onClick={handleNext}
          className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg shadow-lg transition-transform hover:scale-105"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default FlashcardScreen;
