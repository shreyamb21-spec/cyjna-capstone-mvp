/**
 * Top Navigation Bar Component
 * 
 * Displays:
 * - Back button (when not on home screen)
 * - App logo/title
 * - Language switcher
 * - User profile icon
 * 
 * Props:
 * - language: Current language code ('EN' or '中文')
 * - setLanguage: Callback to change language
 * - currentScreen: Current screen name
 * - setCurrentScreen: Callback to navigate screens
 */

import React from 'react';
import Icon from './Icon';

const TopBar = ({ language, setLanguage, currentScreen, setCurrentScreen }) => {
  const showBackButton = currentScreen !== 'home';

  const handleBack = () => {
    // Intelligent back navigation based on current screen
    if (['flashcards', 'pronunciation-module', 'chat'].includes(currentScreen)) {
      setCurrentScreen('lesson-detail');
    } else if (currentScreen === 'lesson-detail') {
      setCurrentScreen('lesson-list');
    } else if (currentScreen === 'lesson-list') {
      setCurrentScreen('home');
    } else if (currentScreen === 'pronunciation') {
      setCurrentScreen('pronunciation-module');
    } else {
      setCurrentScreen('home');
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 h-14 md:h-16 bg-white border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        
        {/* Left Side: Back button or Logo */}
        <div className="flex-1 min-w-0">
          {showBackButton ? (
            <button 
              onClick={handleBack} 
              className="p-2 -ml-2 text-gray-600 hover:text-blue-600"
              aria-label="Go back"
            >
              <Icon name="arrow-left" size={24} />
            </button>
          ) : (
            <div className="text-xl md:text-2xl font-bold text-blue-600">CYJNA</div>
          )}
        </div>
        
        {/* Center Title: Only if back button is present */}
        {showBackButton && (
          <div className="text-xl md:text-2xl font-bold text-blue-600 absolute left-1/2 -translate-x-1/2">
            CYJNA
          </div>
        )}

        {/* Right Side: Language and Profile */}
        <div className="flex-1 min-w-0 flex items-center justify-end gap-4">
          <button 
            onClick={() => setLanguage(language === 'EN' ? '中文' : 'EN')} 
            className="px-3 py-1 text-sm font-semibold border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50"
            aria-label="Toggle language"
          >
            {language === 'EN' ? '中文' : 'EN'}
          </button>
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
            U
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
