/**
 * HomeScreen Component (Dashboard)
 * 
 * Main dashboard displayed after login and onboarding.
 * Shows progress, next lesson, motivational quotes, and quick actions.
 * 
 * Props:
 * - user: User object with name property
 * - learningPlan: Array of lesson objects
 * - recentActivity: Object mapping lesson IDs to activity data
 * - setCurrentScreen: Callback to navigate screens
 * - setRecentActivity: Callback to update activity state
 */

import React, { useState } from 'react';
import Icon from '../components/Icon';

const HomeScreen = ({ user, learningPlan, recentActivity, setCurrentScreen, setRecentActivity }) => {
  const [quote] = useState({ text: "The best time to start learning was yesterday.", author: "Proverb" });

  const completedCount = learningPlan.filter(lesson => recentActivity[lesson.id]).length;
  const progressPercent = (completedCount / learningPlan.length) * 100;
  
  const nextLesson = learningPlan.find(lesson => !recentActivity[lesson.id]);

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-full space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Hi, {user.name}!</h1>

      {/* Motivational Quote */}
      <div className="p-4 bg-white rounded-xl shadow-sm">
        <p className="text-lg italic text-gray-700">"{quote.text}"</p>
        <p className="text-right text-gray-500 font-medium">- {quote.author}</p>
      </div>

      {/* Pronunciation Practice */}
      <div
        onClick={() => setCurrentScreen('pronunciation')}
        className="p-6 bg-blue-500 text-white rounded-xl shadow-lg cursor-pointer transition-transform hover:scale-105 flex items-center justify-between"
      >
        <div>
          <h3 className="text-2xl font-bold">Practice Pronunciation</h3>
          <p className="opacity-90">Let's check your accent!</p>
        </div>
        <Icon name="mic" size={32} />
      </div>

      {/* Next Lesson */}
      {nextLesson ? (
        <div
          onClick={() => setCurrentScreen('lesson-list')}
          className="p-6 bg-white rounded-xl shadow-sm cursor-pointer transition-colors hover:bg-gray-50"
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Next Lesson</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-medium text-blue-600">{nextLesson.title}</p>
              <p className="text-gray-600">{nextLesson.description}</p>
            </div>
            <Icon name="chevron" className="text-gray-400" />
          </div>
        </div>
      ) : (
        <div className="p-6 bg-green-100 text-green-800 rounded-xl shadow-sm text-center">
          <h3 className="text-2xl font-bold">All lessons completed!</h3>
          <p>Congratulations on finishing your learning plan!</p>
        </div>
      )}

      {/* Learning Progress */}
      <div className="p-6 bg-white rounded-xl shadow-sm">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Your Progress</h3>
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-600">Completed Lessons</span>
          <span className="font-bold text-gray-800">{completedCount} / {learningPlan.length}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-green-500 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      {/* Other Actions */}
      <div className="grid grid-cols-2 gap-4">
        <div
          onClick={() => setCurrentScreen('lesson-list')}
          className="p-4 bg-white rounded-xl shadow-sm text-center cursor-pointer hover:shadow-md"
        >
          <Icon name="book" size={30} className="mx-auto text-blue-500 mb-2" />
          <p className="font-semibold text-gray-700">All Lessons</p>
        </div>
        <div
          onClick={() => setCurrentScreen('flashcards')}
          className="p-4 bg-white rounded-xl shadow-sm text-center cursor-pointer hover:shadow-md"
        >
          <Icon name="flashcards" size={30} className="mx-auto text-yellow-500 mb-2" />
          <p className="font-semibold text-gray-700">Flashcards</p>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
