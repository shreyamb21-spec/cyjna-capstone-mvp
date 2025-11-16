/**
 * LoginScreen Component
 * 
 * First screen users see. Prompts for username/name entry.
 * 
 * Props:
 * - onLogin: Callback function with username parameter (function)
 */

import React, { useState } from 'react';

const LoginScreen = ({ onLogin }) => {
  const [username, setUsername] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      onLogin(username.trim());
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-500 to-blue-600 p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome!</h1>
        <p className="text-gray-600 mb-6">Sign in to start learning.</p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your name"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="w-full mt-4 px-6 py-3 bg-blue-500 text-white text-lg font-semibold rounded-lg shadow-lg transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!username.trim()}
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginScreen;
