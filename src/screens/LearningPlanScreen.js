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

      // Generate 5 industry-specific lessons with phrases
      const prompt = `Generate a JSON learning plan for an English learner with this profile:
      - Age: ${userPersona.age || 'Not specified'}
      - Nationality: ${userPersona.nationality || 'Not specified'}
      - Target Industry: ${userPersona.targetIndustry || 'General'}
      - Target City: ${userPersona.targetCity || 'Not specified'}
      
      Create EXACTLY 5 lessons with 10 phrases each for their industry. Response format (valid JSON only, no markdown):
      {
        "lessons": [
          {
            "id": 1,
            "title": "Lesson Title",
            "description": "Brief description",
            "phrases": [
              {"en": "English phrase", "translation": "Chinese translation", "phonetic": "phonetic guide"},
              ...10 phrases total
            ]
          },
          ...5 lessons total
        ]
      }`;

      const systemPrompt = {
        parts: [{ text: "You are an English learning curriculum designer. Generate industry-specific lessons. Respond ONLY with valid JSON." }]
      };

      const jsonConfig = {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            "lessons": {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  "id": { "type": "INTEGER" },
                  "title": { "type": "STRING" },
                  "description": { "type": "STRING" },
                  "phrases": {
                    type: "ARRAY",
                    items: {
                      type: "OBJECT",
                      properties: {
                        "en": { "type": "STRING" },
                        "translation": { "type": "STRING" },
                        "phonetic": { "type": "STRING" }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      };

      const responseText = await callGeminiText(systemPrompt, [
        { role: 'user', parts: [{ text: prompt }] }
      ], jsonConfig);

      const planData = JSON.parse(responseText);
      const lessons = planData.lessons || [];

      // Simulate processing time
      setProgress(85);
      await new Promise(resolve => setTimeout(resolve, 800));

      // Record activity
      if (setRecentActivity) {
        setRecentActivity(prev => [
          { id: Date.now(), text: `Completed onboarding - ${lessons.length} lessons generated`, time: 'Just now' },
          ...prev.slice(0, 4)
        ]);
      }

      setProgress(100);
      setStatus('ready');

      // Pass lessons data back to App via state/context
      // For now, store in localStorage and transition
      localStorage.setItem('learningPlan', JSON.stringify(lessons));

      // Auto-transition after 2 seconds
      const timer = setTimeout(() => {
        setCurrentScreen('home');
      }, 2000);

      return () => clearTimeout(timer);
    } catch (err) {
      console.error('Plan generation error:', err);
      
      // Generate default lessons if API fails
      const defaultLessons = [
        {
          id: 1,
          title: "Getting Started",
          description: "Essential phrases for your first day",
          phrases: Array(10).fill(null).map((_, i) => ({
            en: `Phrase ${i + 1}`,
            translation: `短语 ${i + 1}`,
            phonetic: `phon-ic-${i + 1}`
          }))
        },
        {
          id: 2,
          title: "Common Interactions",
          description: "Everyday conversations",
          phrases: Array(10).fill(null).map((_, i) => ({
            en: `Common phrase ${i + 1}`,
            translation: `常见短语 ${i + 1}`,
            phonetic: `common-phon-${i + 1}`
          }))
        },
        {
          id: 3,
          title: "Building Confidence",
          description: "Intermediate level conversations",
          phrases: Array(10).fill(null).map((_, i) => ({
            en: `Confidence phrase ${i + 1}`,
            translation: `自信短语 ${i + 1}`,
            phonetic: `conf-phon-${i + 1}`
          }))
        },
        {
          id: 4,
          title: "Advanced Scenarios",
          description: "Complex workplace situations",
          phrases: Array(10).fill(null).map((_, i) => ({
            en: `Advanced phrase ${i + 1}`,
            translation: `高级短语 ${i + 1}`,
            phonetic: `adv-phon-${i + 1}`
          }))
        },
        {
          id: 5,
          title: "Industry Specific",
          description: `${userPersona.targetIndustry || 'General'} vocabulary`,
          phrases: Array(10).fill(null).map((_, i) => ({
            en: `Industry phrase ${i + 1}`,
            translation: `行业短语 ${i + 1}`,
            phonetic: `ind-phon-${i + 1}`
          }))
        }
      ];

      localStorage.setItem('learningPlan', JSON.stringify(defaultLessons));
      
      if (err.message && (err.message.includes("401") || err.message.toLowerCase().includes("unauthorized"))) {
        setError("API key missing. Loaded default lessons.");
      } else {
        setError("Generation failed. Loaded default lessons.");
      }
      
      setProgress(100);
      setStatus('ready');
      
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
