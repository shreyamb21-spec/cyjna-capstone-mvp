import React, { useState } from 'react';
import Icon from '../components/Icon';

/**
 * ProgressScreen Component
 * 
 * Displays user learning statistics including:
 * - Weekly study minutes chart
 * - Total lessons completed
 * - Phrases mastered
 * - Streak information
 */
const ProgressScreen = ({ setCurrentScreen, userPersona = {} }) => {
  const [selectedWeek, setSelectedWeek] = useState(0);

  const weekData = [
    { day: 'Mon', minutes: 45, phrases: 8 },
    { day: 'Tue', minutes: 60, phrases: 12 },
    { day: 'Wed', minutes: 30, phrases: 5 },
    { day: 'Thu', minutes: 75, phrases: 15 },
    { day: 'Fri', minutes: 50, phrases: 10 },
    { day: 'Sat', minutes: 90, phrases: 18 },
    { day: 'Sun', minutes: 40, phrases: 8 }
  ];

  const totalMinutes = weekData.reduce((sum, day) => sum + day.minutes, 0);
  const maxMinutes = Math.max(...weekData.map(d => d.minutes));
  
  const stats = [
    { label: 'Lessons Completed', value: '12', icon: 'book', color: 'blue' },
    { label: 'Phrases Mastered', value: '87', icon: 'award', color: 'yellow' },
    { label: 'Current Streak', value: '8 days', icon: 'flame', color: 'red' },
    { label: 'Study This Week', value: `${totalMinutes}m`, icon: 'clock', color: 'green' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-14 pb-20 md:pt-16">
      <div className="px-4 py-6 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-white">Your Progress</h1>
            <button onClick={() => setCurrentScreen('home')} className="p-2 hover:bg-white/20 rounded-lg transition">
              <Icon name="x" size={24} className="text-white" />
            </button>
          </div>
          <p className="text-blue-100">Keep up the great work, {userPersona?.name || 'Learner'}!</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className={`w-10 h-10 rounded-lg bg-${stat.color}-100 flex items-center justify-center mb-3`}>
                <Icon name={stat.icon} size={20} className={`text-${stat.color}-600`} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-600 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Weekly Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Study This Week</h2>
          
          <div className="flex items-end justify-between h-48 gap-1">
            {weekData.map((day, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                <div 
                  className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg cursor-pointer hover:opacity-80 transition relative group"
                  style={{ height: `${(day.minutes / maxMinutes) * 100}%` }}
                  onClick={() => setSelectedWeek(idx)}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition">
                    {day.minutes}m
                  </div>
                </div>
                <span className="text-xs font-semibold text-gray-600">{day.day}</span>
              </div>
            ))}
          </div>

          {selectedWeek >= 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-2"><strong>{weekData[selectedWeek].day}'s Summary:</strong></p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-2xl font-bold text-blue-600">{weekData[selectedWeek].minutes}</p>
                  <p className="text-xs text-gray-600">Minutes Studied</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-2xl font-bold text-green-600">{weekData[selectedWeek].phrases}</p>
                  <p className="text-xs text-gray-600">Phrases Practiced</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Recent Achievements */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Achievements</h2>
          <div className="space-y-3">
            {[
              { badge: '🔥', title: '8-Day Streak', desc: 'Studied for 8 consecutive days' },
              { badge: '⭐', title: '50 Phrases', desc: 'Mastered 50 phrases' },
              { badge: '🎓', title: '5 Lessons', desc: 'Completed 5 full lessons' },
              { badge: '🗣️', title: 'Conversation Hero', desc: 'Completed 10 chat practice sessions' }
            ].map((achievement, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-2xl">{achievement.badge}</span>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{achievement.title}</p>
                  <p className="text-xs text-gray-600">{achievement.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressScreen;
