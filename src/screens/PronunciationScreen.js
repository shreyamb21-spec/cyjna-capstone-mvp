import React, { useState, useEffect } from 'react';
import { callGeminiText } from '../api/geminiApi';
import Icon from '../components/Icon';

/**
 * PronunciationScreen Component
 * 
 * Records user pronunciation and provides AI-powered feedback.
 * Uses Web Speech API for recording and Gemini for analysis.
 */
const PronunciationScreen = ({ phraseData, userPersona, setCurrentScreen, setRecentActivity }) => {
  const [micState, setMicState] = useState('idle');
  const [score, setScore] = useState(null);
  const [timer, setTimer] = useState(0);
  const [recognition, setRecognition] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [improvementTip, setImprovementTip] = useState("");
  const [analysisError, setAnalysisError] = useState(null);

  const phrase = phraseData || { en: "Can you wait 5 minutes?", translation: "你能等5分钟吗？", phonetic: "Nǐ néng děng 5 fēnzhōng ma?" };

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setAnalysisError("Speech recognition is not supported by your browser. Try Chrome or Edge.");
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = 'en-US';

    rec.onresult = (event) => {
      const userTranscript = event.results[0][0].transcript;
      setTranscript(userTranscript);
      analyzePronunciation(userTranscript);
    };

    rec.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setAnalysisError("Speech recognition failed. Please try again.");
      setMicState('idle');
    };

    rec.onend = () => {
      if (micState === 'recording') {
        setMicState('processing');
      }
    };

    setRecognition(rec);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let interval;
    if (micState === 'recording') {
      interval = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [micState]);

  const analyzePronunciation = async (userTranscript) => {
    setMicState('processing');
    setAnalysisError(null);

    const systemPrompt = {
      parts: [{ text: `You are a pronunciation coach. The user is practicing an English phrase.
      The user's persona is: ${JSON.stringify(userPersona)}.
      Their native language is ${userPersona?.nationality}. Use this knowledge to give better tips.
      
      Compare the target phrase to the user's attempt.
      Provide a response in this exact JSON format:
      {
        "score": <an integer score from 0-100, where 100 is perfect>,
        "tip": "<a single, concise, and actionable tip for improvement>"
      }` }]
    };
    
    const contents = [{
      role: 'user',
      parts: [{ text: `Target Phrase: "${phrase.en}"\nUser Attempt: "${userTranscript}"` }]
    }];
    
    const jsonConfig = {
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          "score": { "type": "INTEGER" },
          "tip": { "type": "STRING" }
        },
        required: ["score", "tip"]
      }
    };

    try {
      const responseText = await callGeminiText(systemPrompt, contents, jsonConfig);
      
      if (!responseText || responseText.trim() === "") {
        throw new Error("Analysis failed: AI returned an empty response.");
      }

      const analysis = JSON.parse(responseText);
      setScore(analysis.score);
      setImprovementTip(analysis.tip);
      setMicState('result');
      
      setRecentActivity(prevActivity => [
        { id: Date.now(), text: `Pronunciation score: ${analysis.score}/100`, time: 'Just now' },
        ...prevActivity.slice(0, 4)
      ]);
    } catch (error) {
      console.error("Gemini analysis failed:", error);
      if (error.message && (error.message.includes("401") || error.message.toLowerCase().includes("unauthorized"))) {
        setAnalysisError("Authentication failed (Error 401). This environment's API key is missing or invalid.");
      } else {
        setAnalysisError("Failed to analyze pronunciation. Please try again.");
      }
      setMicState('idle');
    }
  };

  const handleStartRecording = () => {
    if (recognition) {
      setMicState('recording');
      setTimer(0);
      setAnalysisError(null);
      setTranscript("");
      setScore(null);
      setImprovementTip("");
      recognition.start();
    }
  };

  const handleStopRecording = () => {
    if (recognition) {
      recognition.stop();
      setMicState('processing');
    }
  };

  const handleTryAgain = () => {
    setMicState('idle');
    setScore(null);
    setTimer(0);
    setTranscript("");
    setImprovementTip("");
    setAnalysisError(null);
  };

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  const getScoreColor = (s) => s >= 75 ? 'text-green-600' : s >= 50 ? 'text-amber-600' : 'text-red-600';
  const getScoreStroke = (s) => s >= 75 ? '#10B981' : s >= 50 ? '#F59E0B' : '#EF4444';

  return (
    <div className="min-h-screen bg-gray-100 pt-14 pb-16">
      <div className="max-w-2xl mx-auto p-4 md:p-6">
        <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
          <span className="text-xs font-semibold text-gray-500 uppercase">TARGET PHRASE</span>
          <h2 className="text-2xl font-bold text-gray-900 mt-2">{phrase.en}</h2>
          <p className="text-base text-gray-600 mt-1">{phrase.translation}</p>
        </div>
        <div className="bg-white rounded-2xl p-8 shadow-lg min-h-[400px] flex flex-col items-center justify-center">
          
          {micState === 'idle' && (
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6"><Icon name="mic" size={40} className="text-blue-600" /></div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Tap to record</h3>
              <p className="text-sm text-gray-600 mb-8">Speak clearly and naturally</p>
              <button 
                onClick={handleStartRecording} 
                disabled={!recognition}
                className="w-14 h-14 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center disabled:bg-gray-400"
              >
                <Icon name="mic" size={28} className="text-white" />
              </button>
              {analysisError && <p className="text-red-500 text-sm mt-4">{analysisError}</p>}
            </div>
          )}
          
          {micState === 'recording' && (
            <div className="text-center">
              <div className="text-3xl font-semibold text-gray-900 mb-8">{formatTime(timer)}</div>
              <p className="text-sm text-gray-600 mb-8">Recording...</p>
              <button onClick={handleStopRecording} className="px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl">Stop</button>
            </div>
          )}
          
          {micState === 'processing' && (
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-6"></div>
              <p className="text-lg text-gray-700">Analyzing pronunciation...</p>
              {transcript && <p className="text-sm text-gray-500 mt-2">Heard: "{transcript}"</p>}
            </div>
          )}
          
          {micState === 'result' && (
            <div className="w-full">
              <div className="flex justify-center mb-6">
                <div className="relative w-[120px] h-[120px]">
                  <svg width="120" height="120">
                    <circle cx="60" cy="60" r="54" stroke="#E5E7EB" strokeWidth="8" fill="none" />
                    <circle cx="60" cy="60" r="54" stroke={getScoreStroke(score)} strokeWidth="8" fill="none" strokeDasharray={`${2 * Math.PI * 54}`} strokeDashoffset={`${2 * Math.PI * 54 * (1 - score / 100)}`} style={{transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 1s'}} />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold">{score}</span>
                    <span className="text-sm text-gray-500">/ 100</span>
                  </div>
                </div>
              </div>
              <h3 className={`text-center text-xl font-semibold mb-4 ${getScoreColor(score)}`}>
                {score >= 90 ? 'Excellent!' : score >= 75 ? 'Good effort!' : score >= 50 ? 'Not bad!' : 'Keep practicing!'}
              </h3>
              
              <div className="bg-gray-100 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600 text-center">You said: "<strong className="text-gray-900">{transcript}</strong>"</p>
              </div>

              <div className="bg-amber-50 border-l-4 border-amber-500 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Icon name="lightbulb" size={16} className="text-amber-600" />
                  <span className="text-sm font-semibold text-amber-900">Improvement tip</span>
                </div>
                <p className="text-sm text-amber-900">{improvementTip}</p>
              </div>
              
              <div className="flex gap-3">
                <button onClick={handleTryAgain} className="flex-1 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 flex items-center justify-center gap-2">
                  <Icon name="refresh" size={20} />
                  <span>Try again</span>
                </button>
                <button 
                  onClick={() => setCurrentScreen('lesson-detail')}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2"
                >
                  <span>Done</span>
                  <Icon name="check-circle" size={20} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PronunciationScreen;
