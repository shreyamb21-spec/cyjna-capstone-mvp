/**
 * Home Screen
 * 
 * The main dashboard displayed after login showing:
 * - Daily progress indicator
 * - Quick access to start lessons
 * - Recent activity log
 * 
 * Props:
 * - setCurrentScreen: Navigation callback
 * - completedLessonIds: Array of completed lesson IDs
 * - recentActivity: Array of recent user activities
 */

import React from 'react';
import Icon from '../components/Icon';

const HomeScreen = ({ setCurrentScreen, completedLessonIds, recentActivity }) => {
  const totalLessons = 5;
  const lessonsCompleted = completedLessonIds.length;
  const progressPercent = (lessonsCompleted / totalLessons) * 100;

  return (
    <div className="min-h-screen bg-gray-100 pt-14 pb-16 md:pt-16">
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Learn English for your deliveries
          </h1>
          <p className="text-base md:text-lg text-gray-600">
            Practice real phrases you'll use every day
          </p>
        </div>

        {/* Daily Progress Card */}
        <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Today's progress</span>
            <span className="text-sm font-semibold text-blue-600">
              {lessonsCompleted} / {totalLessons} lessons
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all" 
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Start Lesson Card */}
        <div className="grid grid-cols-1 gap-4 mb-8">
          <button 
            onClick={() => setCurrentScreen('lesson-list')} 
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow text-left"
          >
            <Icon name="play-circle" size={32} className="text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Continue lesson
            </h3>
            <p className="text-sm text-gray-600">
              {lessonsCompleted < totalLessons 
                ? `Start Lesson ${lessonsCompleted + 1}` 
                : 'All lessons complete! 🎉'}
            </p>
          </button>
        </div>

        {/* Recent Activity Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Activity
          </h3>
          <div className="space-y-3">
            {recentActivity && recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <div 
                  key={activity.id} 
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
                >
                  <span className="text-sm text-gray-700">{activity.text}</span>
                  <span className="text-xs text-gray-500">{activity.time}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                No recent activity yet. Start a lesson!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
