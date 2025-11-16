/**
 * LessonDetailScreen Component
 * 
 * Displays detailed lesson content including introduction, key phrases, dialogue, explanation, and quiz.
 * Supports text-to-speech for phrases and dialogue lines.
 * Users must answer all quiz questions to mark lesson as complete.
 * 
 * Props:
 * - currentLesson: Current lesson object
 * - setCurrentScreen: Callback to navigate screens
 * - completedLessonIds: Array of completed lesson IDs
 * - setCompletedLessonIds: Callback to update completed lessons
 * - setRecentActivity: Callback to update activity with lesson data
 */

import React, { useState, useEffect } from 'react';
import Icon from '../components/Icon';
import AudioPlayer from '../components/AudioPlayer';
import LoadingScreen from '../components/LoadingScreen';
import ErrorScreen from '../components/ErrorScreen';
import { fetchLessonContent, fetchTTS } from '../api/geminiApi';

const LessonDetailScreen = ({ currentLesson, setCurrentScreen, completedLessonIds, setCompletedLessonIds, setRecentActivity }) => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [showQuizResult, setShowQuizResult] = useState(false);
  const [ttsAudio, setTtsAudio] = useState({});
  const [loadingTts, setLoadingTts] = useState(null);

  const { nativeLanguage, targetLanguage } = JSON.parse(localStorage.getItem('userPrefs'));

  // Fetch lesson content
  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      setError(null);
      try {
        const lessonContent = await fetchLessonContent(currentLesson, nativeLanguage, targetLanguage);
        setContent(lessonContent);
      } catch (err) {
        console.error("Error fetching lesson content:", err);
        setError("Failed to load lesson content. Please try again.");
      }
      setLoading(false);
    };
    fetchContent();
  }, [currentLesson, nativeLanguage, targetLanguage]);

  // Handle TTS for a specific phrase or line
  const handlePlayAudio = async (text, id) => {
    if (ttsAudio[id]) {
      return;
    }
    setLoadingTts(id);
    try {
      const { audioData, mimeType } = await fetchTTS(text);
      setTtsAudio(prev => ({ ...prev, [id]: { base64Audio: audioData, mimeType } }));
    } catch (err) {
      console.error("Error fetching TTS:", err);
    }
    setLoadingTts(null);
  };

  const handleQuizAnswer = (qIndex, answer) => {
    setQuizAnswers(prev => ({ ...prev, [qIndex]: answer }));
  };

  const submitQuiz = () => {
    setShowQuizResult(true);
  };

  const getQuizScore = () => {
    if (!content) return 0;
    let score = 0;
    content.quiz.forEach((q, i) => {
      if (quizAnswers[i] === q.correct_answer) {
        score++;
      }
    });
    return score;
  };

  const markAsComplete = () => {
    const lessonId = currentLesson.id;
    if (!completedLessonIds.includes(lessonId)) {
      setCompletedLessonIds(prev => [...prev, lessonId]);
    }
    // Add lesson content to recent activity for flashcard generation
    setRecentActivity(prev => ({
      ...prev,
      [lessonId]: content.key_phrases 
    }));
    setCurrentScreen('lesson-list');
  };

  if (loading) return <LoadingScreen message="Loading lesson..." />;
  if (error) return <ErrorScreen error={error} onRetry={() => setCurrentScreen('lesson-list')} />;
  if (!content) return null;

  const score = getQuizScore();

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-full">
      <button onClick={() => setCurrentScreen('lesson-list')} className="text-blue-500 font-medium mb-4 flex items-center">
        <Icon name="chevron" className="transform rotate-180" />
        Back to Lessons
      </button>

      <h1 className="text-3xl font-bold text-gray-800 mb-4">{currentLesson.title}</h1>
      
      <div className="space-y-6">
        {/* Introduction */}
        <div className="p-5 bg-white rounded-xl shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Introduction</h2>
          <p className="text-gray-700 leading-relaxed">{content.introduction}</p>
        </div>

        {/* Key Phrases */}
        <div className="p-5 bg-white rounded-xl shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Key Phrases</h2>
          <ul className="space-y-3">
            {content.key_phrases.map((item, index) => (
              <li key={index} className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-medium text-gray-800">{item.phrase}</p>
                  <p className="text-gray-600">{item.translation}</p>
                </div>
                {ttsAudio[`phrase-${index}`] ? (
                  <AudioPlayer {...ttsAudio[`phrase-${index}`]} />
                ) : (
                  <button
                    onClick={() => handlePlayAudio(item.phrase, `phrase-${index}`)}
                    disabled={loadingTts === `phrase-${index}`}
                    className="p-2 rounded-full bg-blue-100 text-blue-600 disabled:opacity-50"
                  >
                    {loadingTts === `phrase-${index}` ? <Icon name="loading" className="animate-spin" /> : <Icon name="volume-2" />}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Dialogue */}
        <div className="p-5 bg-white rounded-xl shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Dialogue</h2>
          <ul className="space-y-3">
            {content.dialogue.map((item, index) => (
              <li key={index} className="flex items-start">
                <span className="font-bold text-gray-800 w-20">{item.speaker}:</span>
                <div className="flex-1">
                  <p className="text-gray-700">{item.line}</p>
                </div>
                {ttsAudio[`line-${index}`] ? (
                  <AudioPlayer {...ttsAudio[`line-${index}`]} />
                ) : (
                  <button
                    onClick={() => handlePlayAudio(item.line, `line-${index}`)}
                    disabled={loadingTts === `line-${index}`}
                    className="p-2 rounded-full bg-blue-100 text-blue-600 disabled:opacity-50 ml-2"
                  >
                    {loadingTts === `line-${index}` ? <Icon name="loading" className="animate-spin" /> : <Icon name="volume-2" />}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Explanation */}
        <div className="p-5 bg-white rounded-xl shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Explanation</h2>
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{content.explanation}</p>
        </div>

        {/* Quiz */}
        <div className="p-5 bg-white rounded-xl shadow-sm pb-24">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Quiz</h2>
          {content.quiz.map((q, qIndex) => (
            <div key={qIndex} className="mb-6">
              <p className="text-lg font-medium text-gray-800 mb-3">{qIndex + 1}. {q.question}</p>
              <div className="space-y-2">
                {q.options.map((option, oIndex) => {
                  const isSelected = quizAnswers[qIndex] === option;
                  let buttonClass = 'bg-gray-100 text-gray-800';
                  if (showQuizResult) {
                    if (option === q.correct_answer) {
                      buttonClass = 'bg-green-100 text-green-800 border-green-500';
                    } else if (isSelected) {
                      buttonClass = 'bg-red-100 text-red-800 border-red-500';
                    }
                  } else if (isSelected) {
                    buttonClass = 'bg-blue-100 text-blue-800 border-blue-500';
                  }

                  return (
                    <button
                      key={oIndex}
                      onClick={() => !showQuizResult && handleQuizAnswer(qIndex, option)}
                      className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${buttonClass} ${!showQuizResult ? 'hover:bg-gray-200' : 'cursor-default'}`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          
          {!showQuizResult ? (
            <button
              onClick={submitQuiz}
              disabled={Object.keys(quizAnswers).length !== content.quiz.length}
              className="w-full px-6 py-3 bg-blue-500 text-white text-lg font-semibold rounded-lg shadow-lg transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Check Answers
            </button>
          ) : (
            <div className="text-center p-4 bg-gray-100 rounded-lg">
              <h3 className="text-xl font-bold">Your score: {score} / {content.quiz.length}</h3>
              {score === content.quiz.length ? (
                <button
                  onClick={markAsComplete}
                  className="mt-4 px-6 py-3 bg-green-500 text-white text-lg font-semibold rounded-lg shadow-lg transition-transform hover:scale-105"
                >
                  Mark as Complete
                </button>
              ) : (
                <button
                  onClick={() => {
                    setShowQuizResult(false);
                    setQuizAnswers({});
                  }}
                  className="mt-4 px-6 py-3 bg-yellow-500 text-white text-lg font-semibold rounded-lg shadow-lg transition-transform hover:scale-105"
                >
                  Try Again
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonDetailScreen;
