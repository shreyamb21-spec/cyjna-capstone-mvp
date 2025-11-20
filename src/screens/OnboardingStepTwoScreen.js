import React, { useState } from 'react';
import Icon from '../components/Icon';

/**
 * OnboardingStepTwoScreen Component
 * 
 * Second step of user registration:
 * - Age input
 * - Nationality selection
 * - Target industry selection
 * - Target city input
 * - Completes user persona setup
 */
const OnboardingStepTwoScreen = ({ setCurrentScreen, setUserPersona, userPersona = {} }) => {
  const [age, setAge] = useState('');
  const [nationality, setNationality] = useState('');
  const [targetIndustry, setTargetIndustry] = useState('');
  const [targetCity, setTargetCity] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const nationalities = [
    'China', 'Japan', 'South Korea', 'Vietnam', 'Thailand',
    'India', 'Brazil', 'Mexico', 'France', 'Germany'
  ];

  const industries = [
    'Delivery Driver',
    'Customer Service',
    'Healthcare',
    'Hospitality',
    'Retail',
    'Manufacturing',
    'Technology'
  ];

  const validateForm = () => {
    if (!age || parseInt(age) < 13 || parseInt(age) > 120) {
      setError('Please enter a valid age (13-120)');
      return false;
    }
    if (!nationality) {
      setError('Please select your nationality');
      return false;
    }
    if (!targetIndustry) {
      setError('Please select your target industry');
      return false;
    }
    if (!targetCity.trim()) {
      setError('Please enter your target city');
      return false;
    }
    return true;
  };

  const handleComplete = async () => {
    setError('');
    if (!validateForm()) return;

    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const completedPersona = {
      ...userPersona,
      age: parseInt(age),
      nationality,
      targetIndustry,
      targetCity,
      completedOnboarding: true
    };
    
    setUserPersona(completedPersona);
    localStorage.setItem('userPersona', JSON.stringify(completedPersona));
    
    setCurrentScreen('learning-plan');
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-600 to-green-700 pt-8 pb-20 px-4 flex flex-col">
      <div className="flex-1 max-w-md mx-auto w-full flex flex-col">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Icon name="user" size={32} className="text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Tell Us About You</h1>
          <p className="text-green-100">Step 2 of 2</p>
        </div>

        {/* Progress Bar */}
        <div className="flex gap-2 mb-6">
          <div className="flex-1 h-1 bg-white/30 rounded-full"></div>
          <div className="flex-1 h-1 bg-white rounded-full"></div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl p-6 shadow-2xl flex-1 flex flex-col">
          <div className="space-y-4 flex-1">
            {/* Age Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => {
                  setAge(e.target.value);
                  setError('');
                }}
                placeholder="Enter your age"
                min="13"
                max="120"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 transition"
              />
            </div>

            {/* Nationality Dropdown */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Nationality</label>
              <select
                value={nationality}
                onChange={(e) => {
                  setNationality(e.target.value);
                  setError('');
                }}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 transition bg-white"
              >
                <option value="">Select your country</option>
                {nationalities.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>

            {/* Industry Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Target Industry</label>
              <div className="grid grid-cols-2 gap-2">
                {industries.map(industry => (
                  <button
                    key={industry}
                    onClick={() => {
                      setTargetIndustry(industry);
                      setError('');
                    }}
                    className={`p-3 rounded-lg text-sm font-semibold border-2 transition ${
                      targetIndustry === industry
                        ? 'bg-green-500 text-white border-green-500'
                        : 'bg-gray-50 text-gray-900 border-gray-200 hover:border-green-300'
                    }`}
                  >
                    {industry}
                  </button>
                ))}
              </div>
            </div>

            {/* City Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Target City</label>
              <input
                type="text"
                value={targetCity}
                onChange={(e) => {
                  setTargetCity(e.target.value);
                  setError('');
                }}
                placeholder="e.g., New York, Chicago, Austin"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 transition"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded">
                <p className="text-sm text-red-700 font-semibold">{error}</p>
              </div>
            )}

            {/* Info Box */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-xs text-green-900">
                ✓ We'll personalize your learning content based on your industry and location.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 mt-6">
            <button
              onClick={handleComplete}
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Setting Up...</span>
                </>
              ) : (
                <>
                  <span>Complete Setup</span>
                  <Icon name="arrow-right" size={18} />
                </>
              )}
            </button>
            
            <button
              onClick={() => setCurrentScreen('onboarding')}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold py-3 rounded-xl transition"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingStepTwoScreen;
