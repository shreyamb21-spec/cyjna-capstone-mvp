/**
 * Main App Component
 * 
 * Central orchestrator for the CYJNA language learning application.
 * Manages:
 * - Global application state
 * - Screen navigation and routing
 * - User persona and learning data
 * - Component imports and rendering
 * 
 * Screen Flow:
 * Onboarding → Learning Plan Generation → Home (Dashboard) → Lessons/Chat/Progress
 */

import React, { useState } from 'react';

// Components
import TopBar from './components/TopBar';
import BottomNav from './components/BottomNav';

// Screens
import HomeScreen from './screens/HomeScreen';
import LessonListScreen from './screens/LessonListScreen';
import LessonDetailScreen from './screens/LessonDetailScreen';
import FlashcardScreen from './screens/FlashcardScreen';
import PronunciationModuleScreen from './screens/PronunciationModuleScreen';
import PronunciationScreen from './screens/PronunciationScreen';
import ChatScreen from './screens/ChatScreen';
import ProgressScreen from './screens/ProgressScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import OnboardingStepTwoScreen from './screens/OnboardingStepTwoScreen';
import LearningPlanScreen from './screens/LearningPlanScreen';

export default function App() {
  // --- Navigation State ---
  const [currentScreen, setCurrentScreen] = useState('onboarding');
  const [language, setLanguage] = useState('EN');

  // --- User & Learning State ---
  const [userPersona, setUserPersona] = useState(null);
  const [learningPlan, setLearningPlan] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [completedLessonIds, setCompletedLessonIds] = useState([]);
  const [recentActivity, setRecentActivity] = useState([
    { id: 1, text: 'Welcome to CYJNA!', time: 'Now' },
  ]);

  // --- Pronunciation Practice State ---
  const [pronunciationPhrase, setPronunciationPhrase] = useState(null);

  // --- Handlers ---
  const handleSetCurrentScreen = (screen) => {
    // Special handling for chat-main to clear lesson context
    if (screen === 'chat-main') {
      setCurrentLesson(null);
      setCurrentScreen('chat');
    } else {
      setCurrentScreen(screen);
    }
  };

  // --- Conditions ---
  const showOnboarding = ['onboarding', 'onboarding-step-2', 'learning-plan-generator'].includes(currentScreen);
  const showNavigation = !showOnboarding;

  // --- Render ---
  return (
    <div className="app min-h-screen bg-gray-100">
      {/* Top Navigation */}
      {showNavigation && (
        <TopBar 
          language={language} 
          setLanguage={setLanguage} 
          currentScreen={currentScreen}
          setCurrentScreen={handleSetCurrentScreen}
        />
      )}

      {/* Main Content */}
      <main className="min-h-screen">
        {/* Onboarding Flow */}
        {currentScreen === 'onboarding' && (
          <OnboardingScreen 
            setCurrentScreen={handleSetCurrentScreen}
            setUserPersona={setUserPersona}
          />
        )}
        {currentScreen === 'onboarding-step-two' && (
          <OnboardingStepTwoScreen 
            setCurrentScreen={handleSetCurrentScreen}
            setUserPersona={setUserPersona}
            userPersona={userPersona}
          />
        )}
        {currentScreen === 'learning-plan' && (
          <LearningPlanScreen 
            userPersona={userPersona} 
            setCurrentScreen={handleSetCurrentScreen}
            setRecentActivity={setRecentActivity}
          />
        )}

        {/* Main App Screens */}
        {currentScreen === 'home' && (
          <HomeScreen 
            setCurrentScreen={handleSetCurrentScreen} 
            completedLessonIds={completedLessonIds} 
            recentActivity={recentActivity} 
          />
        )}

        {/* Lesson Flow */}
        {currentScreen === 'lesson-list' && (
          <LessonListScreen 
            learningPlan={learningPlan} 
            setCurrentScreen={handleSetCurrentScreen} 
            setCurrentLesson={setCurrentLesson} 
          />
        )}
        {currentScreen === 'lesson-detail' && (
          <LessonDetailScreen 
            currentLesson={currentLesson} 
            setCurrentScreen={handleSetCurrentScreen} 
            completedLessonIds={completedLessonIds} 
            setCompletedLessonIds={setCompletedLessonIds}
            setRecentActivity={setRecentActivity}
          />
        )}
        {currentScreen === 'flashcards' && (
          <FlashcardScreen 
            setCurrentScreen={handleSetCurrentScreen} 
            setPronunciationPhrase={setPronunciationPhrase} 
            currentLesson={currentLesson} 
          />
        )}
        {currentScreen === 'pronunciation-module' && (
          <PronunciationModuleScreen 
            currentLesson={currentLesson} 
            setCurrentScreen={handleSetCurrentScreen} 
            setPronunciationPhrase={setPronunciationPhrase} 
          />
        )}

        {/* Practice Screens */}
        {currentScreen === 'chat' && (
          <ChatScreen 
            userPersona={userPersona} 
            currentLesson={currentLesson} 
            setRecentActivity={setRecentActivity}
          />
        )}
        {currentScreen === 'pronunciation' && (
          <PronunciationScreen 
            phraseData={pronunciationPhrase} 
            userPersona={userPersona} 
            setCurrentScreen={handleSetCurrentScreen}
            setRecentActivity={setRecentActivity}
          />
        )}

        {/* Statistics Screen */}
        {currentScreen === 'progress' && (
          <ProgressScreen 
            setCurrentScreen={handleSetCurrentScreen}
            userPersona={userPersona}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      {showNavigation && (
        <BottomNav 
          currentScreen={currentScreen} 
          setCurrentScreen={handleSetCurrentScreen} 
        />
      )}
    </div>
  );
}


