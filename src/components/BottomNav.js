/**
 * Bottom Navigation Bar Component
 * 
 * Fixed navigation bar displayed at the bottom of the screen
 * Provides navigation between main sections:
 * - Home: Main dashboard
 * - Lessons: Lesson list and content
 * - Chat: Practice chat scenarios
 * - Progress: User statistics
 * 
 * Props:
 * - currentScreen: Currently active screen
 * - setCurrentScreen: Callback to navigate to a screen
 */

import React from 'react';
import Icon from './Icon';

const BottomNav = ({ currentScreen, setCurrentScreen }) => {
  const navItems = [
    { id: 'home', icon: 'home', label: 'Home' },
    { id: 'lesson-list', icon: 'book', label: 'Lessons' },
    { id: 'chat', icon: 'chat', label: 'Chat' },
    { id: 'progress', icon: 'chart', label: 'Progress' }
  ];

  const isActive = (itemId) => {
    // Handle related screens for each nav item
    if (itemId === 'lesson-list') {
      return ['lesson-detail', 'flashcards', 'pronunciation-module'].includes(currentScreen);
    }
    if (itemId === 'chat') {
      return currentScreen === 'chat' || currentScreen === 'chat-main';
    }
    return currentScreen === itemId;
  };

  const handleNavClick = (itemId) => {
    if (itemId === 'chat') {
      setCurrentScreen('chat-main');
    } else {
      setCurrentScreen(itemId);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 z-50">
      <div className="max-w-7xl mx-auto h-full flex items-center justify-around">
        {navItems.map(item => (
          <button 
            key={item.id} 
            onClick={() => handleNavClick(item.id)}
            className={`flex flex-col items-center justify-center gap-1 min-w-[60px] transition-colors ${
              isActive(item.id) ? 'text-blue-600' : 'text-gray-500'
            }`}
            aria-label={`Navigate to ${item.label}`}
          >
            <Icon name={item.icon} size={24} />
            <span className={`text-xs ${isActive(item.id) ? 'font-semibold' : ''}`}>
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default BottomNav;
