/**
 * NavBar Component
 * 
 * Navigation bar displayed at the bottom of authenticated screens.
 * Provides navigation between main sections: Home, Lessons, Flashcards, and Stats.
 * 
 * Props:
 * - currentScreen: Currently active screen (string)
 * - setCurrentScreen: Callback to change screens (function)
 */

import React from 'react';
import Icon from './Icon';

const NavBar = ({ currentScreen, setCurrentScreen }) => {
  const navItems = [
    { name: 'home', label: 'Home', icon: 'home' },
    { name: 'lesson-list', label: 'Lessons', icon: 'book' },
    { name: 'flashcards', label: 'Cards', icon: 'flashcards' },
    { name: 'stats', label: 'Stats', icon: 'chart-bar' },
  ];

  // Map related screens to their main nav item
  const getActiveItem = () => {
    if (['home', 'pronunciation'].includes(currentScreen)) return 'home';
    if (['lesson-list', 'lesson-detail'].includes(currentScreen)) return 'lesson-list';
    return currentScreen;
  }
  const activeItem = getActiveItem();

  return (
    <div className="fixed bottom-0 left-0 right-0 w-full max-w-lg mx-auto bg-white shadow-top z-30 rounded-t-2xl border-t border-gray-200">
      <div className="flex justify-around items-center h-16">
        {navItems.map(item => (
          <button
            key={item.name}
            onClick={() => setCurrentScreen(item.name)}
            className={`flex flex-col items-center justify-center w-full transition-colors ${
              activeItem === item.name ? 'text-blue-500' : 'text-gray-400'
            }`}
          >
            <Icon name={item.icon} size={28} />
            <span className="text-xs font-medium mt-1">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default NavBar;
