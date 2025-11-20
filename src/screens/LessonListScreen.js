/**
 * Lesson List Screen
 * 
 * Displays all available lessons organized by difficulty.
 * Users can select a lesson to start learning.
 * 
 * Props:
 * - learningPlan: Array of phrases from AI
 * - setCurrentScreen: Navigation callback
 * - setCurrentLesson: Set selected lesson
 */

import React from 'react';
import Icon from '../components/Icon';

const LessonListScreen = ({ learningPlan, setCurrentScreen, setCurrentLesson }) => {
  // Split 50 phrases into 5 lessons (10 phrases each)
  const lessons = [];
  const phrasesPerLesson = 10;
  const totalLessons = 5;
  const lessonTitles = [
    "Lesson 1: Getting Started",
    "Lesson 2: Common Interactions",
    "Lesson 3: Building Confidence",
    "Lesson 4: Advanced Scenarios",
    "Lesson 5: Industry Specific"
  ];

  for (let i = 0; i < totalLessons; i++) {
    const start = i * phrasesPerLesson;
    const end = start + phrasesPerLesson;
    const lessonPhrases = learningPlan.slice(start, end);
    
    lessons.push({
      id: `lesson${i + 1}`,
      title: lessonTitles[i] || `Lesson ${i + 1}`,
      phrases: lessonPhrases,
      phraseCount: lessonPhrases.length
    });
  }

  const handleLessonSelect = (lesson) => {
    setCurrentLesson(lesson);
    setCurrentScreen('lesson-detail');
  };

  return (
    <div className="min-h-screen bg-gray-100 pt-14 pb-16 md:pt-16">
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Your Lessons</h1>
        
        <div className="space-y-4">
          {lessons.map((lesson) => (
            <button 
              key={lesson.id} 
              onClick={() => handleLessonSelect(lesson)} 
              className="w-full bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow text-left flex items-center justify-between"
              disabled={lesson.phrases.length === 0}
            >
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-1">
                  {lesson.title}
                </h2>
                <p className="text-sm text-gray-600">
                  {lesson.phraseCount} phrases
                </p>
              </div>
              <Icon name="chevron-right" size={24} className="text-gray-400" />
            </button>
          ))}
          
          {learningPlan.length === 0 && (
            <p className="text-gray-600 text-center py-8">
              Your lesson plan is empty. Please try re-onboarding to generate one.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonListScreen;
