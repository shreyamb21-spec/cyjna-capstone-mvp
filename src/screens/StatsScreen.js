/**
 * StatsScreen Component
 * 
 * Displays user statistics including phrases practiced, perfect scores,
 * average score, current streak, weekly activity chart, and leaderboard.
 */

import React from 'react';

const StatsScreen = () => {
  const activityData = [
    { day: 'Mon', phrases: 10 },
    { day: 'Tue', phrases: 15 },
    { day: 'Wed', phrases: 8 },
    { day: 'Thu', phrases: 12 },
    { day: 'Fri', phrases: 20 },
    { day: 'Sat', phrases: 18 },
    { day: 'Sun', phrases: 5 },
  ];
  const maxPhrases = Math.max(...activityData.map(d => d.phrases));

  const stats = [
    { label: 'Phrases Practiced', value: '128', color: 'text-blue-500' },
    { label: 'Perfect Scores', value: '14', color: 'text-green-500' },
    { label: 'Avg. Score', value: '89%', color: 'text-yellow-500' },
    { label: 'Current Streak', value: '7 Days', color: 'text-orange-500' },
  ];

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-full space-y-6 pb-24">
      <h1 className="text-3xl font-bold text-gray-800">Your Stats</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {stats.map(stat => (
          <div key={stat.label} className="bg-white rounded-xl shadow-sm p-4 text-center">
            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Weekly Activity Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">Weekly Activity</h3>
        <div className="flex justify-between items-end h-40">
          {activityData.map(data => (
            <div key={data.day} className="flex flex-col items-center w-1/8">
              <div
                className="w-8 bg-blue-400 rounded-t-md transition-all"
                style={{ height: `${(data.phrases / maxPhrases) * 100}%` }}
              ></div>
              <span className="text-xs text-gray-600 mt-2">{data.day}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 text-center mt-4">Phrases practiced per day</p>
      </div>

      {/* Leaderboard (Mock) */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <h3 className="text-xl font-semibold text-gray-800 p-6 pb-0">Leaderboard</h3>
        <ul className="divide-y divide-gray-100">
          <li className="flex items-center justify-between p-4">
            <div className="flex items-center">
              <span className="font-bold text-lg mr-4">1.</span>
              <img className="w-10 h-10 rounded-full mr-3" src="https://placehold.co/40x40/f0e9f9/a78bfa?text=A" alt="Avatar" />
              <p className="font-medium text-gray-800">Anna W.</p>
            </div>
            <p className="font-bold text-gray-700">12,400 XP</p>
          </li>
          <li className="flex items-center justify-between p-4 bg-blue-50">
            <div className="flex items-center">
              <span className="font-bold text-lg mr-4">2.</span>
              <img className="w-10 h-10 rounded-full mr-3" src="https://placehold.co/40x40/e0f2fe/38bdf8?text=U" alt="Avatar" />
              <p className="font-medium text-blue-800">You</p>
            </div>
            <p className="font-bold text-blue-800">10,200 XP</p>
          </li>
          <li className="flex items-center justify-between p-4">
            <div className="flex items-center">
              <span className="font-bold text-lg mr-4">3.</span>
              <img className="w-10 h-10 rounded-full mr-3" src="https://placehold.co/40x40/fefce8/eab308?text=M" alt="Avatar" />
              <p className="font-medium text-gray-800">Mike L.</p>
            </div>
            <p className="font-bold text-gray-700">9,800 XP</p>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default StatsScreen;
