/**
 * Lesson Detail Screen
 * 
 * Shows a specific lesson with available study modules:
 * - Flashcards: Quick phrase review
 * - Pronunciation: Practice speaking
 * - Chat: Real conversation scenarios
 * 
 * Props:
 * - currentLesson: The selected lesson object
 * - setCurrentScreen: Navigation callback
 * - completedLessonIds: Array of completed lesson IDs
 * - setCompletedLessonIds: Update completion status
 * - setRecentActivity: Log user actions
 */

import React from 'react';
import Icon from '../components/Icon';

const LessonDetailScreen = ({ 
  currentLesson, 
  setCurrentScreen, 
  completedLessonIds, 
  setCompletedLessonIds, 
  setRecentActivity 
}) => {
  if (!currentLesson) {
    return (
      <div className="min-h-screen bg-gray-100 pt-14 pb-16 md:pt-16 flex items-center justify-center">
        <p className="text-gray-600">No lesson selected. Go back to the lesson list.</p>
      </div>
    );
  }

  const isCompleted = completedLessonIds.includes(currentLesson.id);

  const handleMarkComplete = () => {
    if (isCompleted) return;
    setCompletedLessonIds(ids => [...new Set([...ids, currentLesson.id])]);
    setRecentActivity(prevActivity => [
      { id: Date.now(), text: `Completed ${currentLesson.title}`, time: 'Just now' },
      ...prevActivity.slice(0, 4)
    ]);
  };

  const modules = [
    { 
      id: 'flashcards', 
      title: 'Flash Cards', 
      icon: 'card-stack', 
      description: 'Review words and phrases', 
      screen: 'flashcards' 
    },
    { 
      id: 'pronunciation', 
      title: 'Pronunciation Practice', 
      icon: 'mic', 
      description: 'Practice speaking each phrase', 
      screen: 'pronunciation-module' 
    },
    { 
      id: 'chat', 
      title: 'Practice Chat', 
      icon: 'chat', 
      description: 'Use phrases in a real chat', 
      screen: 'chat' 
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 pt-14 pb-16 md:pt-16">
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {currentLesson.title}
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          {currentLesson.phrases.length} phrases to master
        </p>
        
        {/* Study Modules */}
        <div className="space-y-4 mb-8">
          {modules.map(module => (
            <button
              key={module.id}
              onClick={() => setCurrentScreen(module.screen)}
              className="w-full bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow text-left flex items-center gap-5"
            >
              <div className="flex-shrink-0 w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                <Icon name={module.icon} size={28} className="text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {module.title}
                </h2>
                <p className="text-sm text-gray-600">
                  {module.description}
                </p>
              </div>
              <Icon name="chevron-right" size={24} className="text-gray-400 ml-auto" />
            </button>
          ))}
        </div>
        
        {/* Mark Complete Button */}
        <button
          onClick={handleMarkComplete}
          disabled={isCompleted}
          className="w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          <Icon name="check-circle" size={20} />
          <span>{isCompleted ? 'Lesson Completed!' : 'Mark as Complete'}</span>
        </button>
      </div>
    </div>
  );
};

export default LessonDetailScreen;
