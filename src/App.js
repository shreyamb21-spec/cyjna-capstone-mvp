/**
 * Main App Component
 * 
 * This is the central application component that manages:
 * - Global state (user, learning plan, completed lessons, etc.)
 * - Screen navigation and routing
 * - Persistent state via localStorage
 * - Integration of all screens and components
 * 
 * Directory Structure:
 * /src
 *   /api - API functions and Gemini integration
 *   /components - Reusable UI components (Icon, AudioPlayer, NavBar, etc.)
 *   /config - Configuration files (API config, constants)
 *   /screens - Full-page screen components
 *   /utils - Utility functions (audio helpers, etc.)
 *   App.js - This main component
 *   index.js - Entry point
 * 
 * Screens:
 * - login: User login
 * - onboarding: Language selection
 * - onboarding-step-2: Level and goals selection
 * - home: Main dashboard
 * - lesson-list: All lessons view
 * - lesson-detail: Detailed lesson with content and quiz
 * - flashcards: Flashcard study mode
 * - stats: User statistics
 * - pronunciation: Pronunciation practice modal
 */

import React, { useState, useEffect } from 'react';
import LoginScreen from './screens/LoginScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import OnboardingStepTwoScreen from './screens/OnboardingStepTwoScreen';
import HomeScreen from './screens/HomeScreen';
import LessonListScreen from './screens/LessonListScreen';
import LessonDetailScreen from './screens/LessonDetailScreen';
import FlashcardScreen from './screens/FlashcardScreen';
import StatsScreen from './screens/StatsScreen';
import PronunciationScreen from './screens/PronunciationScreen';
import LoadingScreen from './components/LoadingScreen';
import ErrorScreen from './components/ErrorScreen';
import NavBar from './components/NavBar';
import { fetchLearningPlan } from './api/geminiApi';

export default function App() {
  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [learningPlan, setLearningPlan] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [completedLessonIds, setCompletedLessonIds] = useState([]);
  const [recentActivity, setRecentActivity] = useState({});
  const [currentScreen, setCurrentScreen] = useState('login');

  // Constants for pronunciation practice
  const pronunciationPhrase = 'Guten Tag! Wie gehts?';
  const language = 'German';

  // Custom hook to persist state to localStorage
  const usePersistentState = (key, defaultValue) => {
    const [state, setState] = useState(() => {
      const storedValue = localStorage.getItem(key);
      return storedValue ? JSON.parse(storedValue) : defaultValue;
    });

    useEffect(() => {
      localStorage.setItem(key, JSON.stringify(state));
    }, [key, state]);

    return [state, setState];
  };

  // Persistent state declarations
  const [persistentUser, setPersistentUser] = usePersistentState('cyjna-user', null);
  const [persistentLearningPlan, setPersistentLearningPlan] = usePersistentState('cyjna-learningPlan', []);
  const [persistentCompletedIds, setPersistentCompletedIds] = usePersistentState('cyjna-completedIds', []);
  const [persistentRecentActivity, setPersistentRecentActivity] = usePersistentState('cyjna-recentActivity', {});

  // Initialize app on mount
  useEffect(() => {
    if (persistentUser) {
      setUser(persistentUser);
      setLearningPlan(persistentLearningPlan);
      setCompletedLessonIds(persistentCompletedIds);
      setRecentActivity(persistentRecentActivity);
      
      if (persistentLearningPlan.length === 0) {
        setCurrentScreen('onboarding');
      } else {
        setCurrentScreen('home');
      }
    } else {
      setCurrentScreen('login');
    }
    setIsLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle user login
  const handleLogin = (name) => {
    const newUser = { name };
    setUser(newUser);
    setPersistentUser(newUser);
    setCurrentScreen('onboarding');
  };

  // Handle onboarding completion
  const handleOnboardingComplete = async (level, goals) => {
    setIsLoading(true);
    try {
      const { nativeLanguage, targetLanguage } = JSON.parse(localStorage.getItem('userPrefs'));
      const plan = await fetchLearningPlan(nativeLanguage, targetLanguage, level, goals);
      setLearningPlan(plan);
      setPersistentLearningPlan(plan);
      setCurrentScreen('home');
    } catch (err) {
      console.error("Failed to create learning plan:", err);
      setError("Could not create your learning plan. Please try again.");
    }
    setIsLoading(false);
  };

  // Handle screen navigation
  const handleSetCurrentScreen = (screen) => {
    console.log("Navigating to screen:", screen);
    setCurrentScreen(screen);
  };

  // Handle retry on error
  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    if (persistentUser) {
      setCurrentScreen('home');
    } else {
      setCurrentScreen('login');
    }
    setIsLoading(false);
  };

  // Render loading state
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Render error state
  if (error) {
    return <ErrorScreen error={error} onRetry={handleRetry} />;
  }

  // Render authentication screens
  if (currentScreen === 'login') {
    return <LoginScreen onLogin={handleLogin} />;
  }

  if (currentScreen === 'onboarding') {
    return <OnboardingScreen setCurrentScreen={handleSetCurrentScreen} />;
  }

  if (currentScreen === 'onboarding-step-2') {
    return <OnboardingStepTwoScreen onCompleteOnboarding={handleOnboardingComplete} />;
  }

  // Render main app with navigation bar
  const mainScreens = ['home', 'lesson-list', 'flashcards', 'stats'];
  const showsNavBar = mainScreens.includes(currentScreen);

  return (
    <div className="h-screen w-screen flex flex-col font-sans max-w-lg mx-auto bg-gray-50 shadow-2xl">
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-16">
        {currentScreen === 'home' && (
          <HomeScreen
            user={user}
            learningPlan={learningPlan}
            recentActivity={recentActivity}
            setCurrentScreen={handleSetCurrentScreen}
            setRecentActivity={setPersistentRecentActivity}
          />
        )}
        {currentScreen === 'lesson-list' && (
          <LessonListScreen
            learningPlan={learningPlan}
            setCurrentScreen={handleSetCurrentScreen}
            setCurrentLesson={setCurrentLesson}
            completedLessonIds={completedLessonIds}
          />
        )}
        {currentScreen === 'lesson-detail' && (
          <LessonDetailScreen
            currentLesson={currentLesson}
            setCurrentScreen={handleSetCurrentScreen}
            completedLessonIds={completedLessonIds}
            setCompletedLessonIds={setPersistentCompletedIds}
            setRecentActivity={setPersistentRecentActivity}
          />
        )}
        {currentScreen === 'flashcards' && (
          <FlashcardScreen
            recentActivity={recentActivity}
            setCurrentScreen={handleSetCurrentScreen}
            completedLessonIds={completedLessonIds}
          />
        )}
        {currentScreen === 'stats' && <StatsScreen />}
      </main>

      {/* Navigation Bar - shown only on main screens */}
      {showsNavBar && (
        <NavBar
          currentScreen={currentScreen}
          setCurrentScreen={handleSetCurrentScreen}
        />
      )}

      {/* Pronunciation Modal - overlays on top */}
      {currentScreen === 'pronunciation' && (
        <PronunciationScreen
          phrase={pronunciationPhrase}
          language={language}
          onClose={() => handleSetCurrentScreen('home')}
        />
      )}

      {/* CSS for flashcard flip effect */}
      <style>{`
        .perspective {
          perspective: 1000px;
        }
        .transform-style-preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
        .shadow-top {
          box-shadow: 0 -4px 10px -1px rgba(0, 0, 0, 0.05);
        }
      `}</style>
    </div>
  );
}
