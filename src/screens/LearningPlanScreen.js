import React, { useState, useEffect } from 'react';
import { callGeminiText } from '../api/geminiApi';
import Icon from '../components/Icon';

/**
 * LearningPlanScreen Component
 * 
 * Displays loading state while generating personalized learning plan from Gemini API.
 * Shows animated progress and contextual tips.
 * Transitions to HomeScreen once plan is ready.
 */
const LearningPlanScreen = ({ setCurrentScreen, userPersona = {}, setRecentActivity }) => {
  const [status, setStatus] = useState('generating');
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  const tips = [
    '💡 Regular practice is key: 15 minutes daily is better than 2 hours weekly',
    '🎯 Focus on phrases relevant to your industry to learn faster',
    '📱 Use the flashcard feature to review during breaks',
    '🗣️ Practice pronunciation daily for best results',
    '📊 Check your progress to stay motivated'
  ];

  const [currentTip, setCurrentTip] = useState(0);

  useEffect(() => {
    let tipInterval;
    if (status === 'generating') {
      tipInterval = setInterval(() => {
        setCurrentTip(prev => (prev + 1) % tips.length);
      }, 5000);
    }
    return () => clearInterval(tipInterval);
  }, [status, tips.length]);

  useEffect(() => {
    let progressInterval;
    if (status === 'generating') {
      progressInterval = setInterval(() => {
        setProgress(prev => {
          const next = prev + Math.random() * 20;
          return next > 95 ? 95 : next;
        });
      }, 600);
    }
    return () => clearInterval(progressInterval);
  }, [status]);

  useEffect(() => {
    generatePlan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generatePlan = async () => {
    try {
      setStatus('generating');
      setError(null);

      // Simulate API call with Gemini to generate a personalized learning plan
      const prompt = `Create a personalized learning plan for an English learner with this profile:
      - Age: ${userPersona.age || 'Not specified'}
      - Nationality: ${userPersona.nationality || 'Not specified'}
      - Target Industry: ${userPersona.targetIndustry || 'General'}
      - Target City: ${userPersona.targetCity || 'Not specified'}
      
      Provide a 2-3 sentence motivational overview of their personalized learning path.
      Focus on industry-specific language skills they need.`;

      const systemPrompt = {
        parts: [{ text: "You are an English learning coach. Provide encouraging and practical guidance." }]
      };

      await callGeminiText(systemPrompt, [
        { role: 'user', parts: [{ text: prompt }] }
      ]);

      // Simulate processing time
      setProgress(85);
      await new Promise(resolve => setTimeout(resolve, 800));

      // Record activity
      if (setRecentActivity) {
        setRecentActivity(prev => [
          { id: Date.now(), text: 'Completed onboarding - Plan generated', time: 'Just now' },
          ...prev.slice(0, 4)
        ]);
      }

      setProgress(100);
      setStatus('ready');

      // Auto-transition after 2 seconds
      const timer = setTimeout(() => {
        setCurrentScreen('home');
      }, 2000);

      return () => clearTimeout(timer);
    } catch (err) {
      if (err.message && (err.message.includes("401") || err.message.toLowerCase().includes("unauthorized"))) {
        setError("Authentication failed (Error 401). Unable to generate personalized plan. Proceeding with default content.");
      } else {
        setError("Unable to generate plan. You can still proceed with default lessons.");
      }
      // Continue anyway after 2 seconds
      const timer = setTimeout(() => {
        setCurrentScreen('home');
      }, 2000);
      return () => clearTimeout(timer);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 pt-8 pb-20 px-4 flex items-center justify-center">
      <div className="max-w-md w-full">
        {/* Main Content */}
        <div className="bg-white rounded-2xl p-8 shadow-2xl text-center">
          {/* Icon Animation */}
          <div className="mb-6">
            {status === 'generating' ? (
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 rounded-full bg-purple-100 animate-pulse"></div>
                <div className="absolute inset-2 rounded-full bg-purple-50"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Icon name="sparkles" size={40} className="text-purple-600 animate-bounce" />
                </div>
              </div>
            ) : (
              <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                <Icon name="check-circle" size={40} className="text-green-600" />
              </div>
            )}
          </div>

          {/* Header Text */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {status === 'generating' ? 'Creating Your Plan' : 'Ready to Learn!'}
          </h1>
          <p className="text-gray-600 mb-6">
            {status === 'generating'
              ? 'We\'re personalizing your learning experience...'
              : 'Your personalized plan is ready!'}
          </p>

          {/* Progress Bar */}
          {status === 'generating' && (
            <div className="mb-6">
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-600 mt-2">{Math.floor(progress)}%</p>
            </div>
          )}

          {/* Tips Carousel */}
          {status === 'generating' && (
            <div className="bg-purple-50 rounded-lg p-4 mb-6 min-h-20 flex items-center">
              <div className="flex items-start gap-3">
                <span className="text-lg flex-shrink-0">{tips[currentTip][0]}</span>
                <p className="text-sm text-gray-700">{tips[currentTip].substring(2)}</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
              <p className="text-xs text-yellow-800">{error}</p>
            </div>
          )}

          {/* User Info Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <p className="text-xs font-semibold text-gray-600 uppercase mb-3">Your Profile</p>
            <div className="space-y-2 text-sm">
              {userPersona.nationality && (
                <div className="flex justify-between">
                  <span className="text-gray-600">📍 Nationality</span>
                  <span className="font-semibold text-gray-900">{userPersona.nationality}</span>
                </div>
              )}
              {userPersona.targetIndustry && (
                <div className="flex justify-between">
                  <span className="text-gray-600">💼 Industry</span>
                  <span className="font-semibold text-gray-900">{userPersona.targetIndustry}</span>
                </div>
              )}
              {userPersona.age && (
                <div className="flex justify-between">
                  <span className="text-gray-600">👤 Age</span>
                  <span className="font-semibold text-gray-900">{userPersona.age}</span>
                </div>
              )}
              {userPersona.targetCity && (
                <div className="flex justify-between">
                  <span className="text-gray-600">🏙️ City</span>
                  <span className="font-semibold text-gray-900">{userPersona.targetCity}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {status === 'ready' && (
            <button
              onClick={() => setCurrentScreen('home')}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
            >
              <span>Start Learning</span>
              <Icon name="arrow-right" size={18} />
            </button>
          )}

          {status === 'generating' && (
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
              <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              <span>Please wait...</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-white/80 text-xs mt-6">
          This should take less than 30 seconds
        </p>
      </div>
    </div>
  );
};

export default LearningPlanScreen;
