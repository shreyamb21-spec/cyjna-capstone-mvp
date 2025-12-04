import React, { useState, useEffect } from 'react';

// --- API Configuration ---
// Per instructions, API key is an empty string.
// YOU MUST REPLACE "" WITH A VALID API KEY FOR THE APP TO WORK.
const GEMINI_API_KEY = "AIzaSyAYB08lrPWeZzv_HXdzRp-0mFsTGZVoFqE";
const GEMINI_TEXT_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${GEMINI_API_KEY}`;
const GEMINI_TTS_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${GEMINI_API_KEY}`;

// --- Audio Helper Functions ---

/**
 * Decodes Base64 string to ArrayBuffer.
 */
function base64ToArrayBuffer(base64) {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Converts raw PCM data (Int16Array) to a WAV Blob.
 */
function pcmToWav(pcmData, sampleRate) {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = pcmData.length * 2; // 2 bytes per sample (Int16)
  const fileSize = 36 + dataSize;

  const buffer = new ArrayBuffer(fileSize + 8); // +8 for RIFF chunk
  const view = new DataView(buffer);

  // RIFF header
  view.setUint32(0, 0x52494646, false); // "RIFF"
  view.setUint32(4, fileSize, true); // File size
  view.setUint32(8, 0x57415645, false); // "WAVE"

  // "fmt " sub-chunk
  view.setUint32(12, 0x666d7420, false); // "fmt "
  view.setUint32(16, 16, true); // Sub-chunk size (16 for PCM)
  view.setUint16(20, 1, true); // Audio format (1 for PCM)
  view.setUint16(22, numChannels, true); // Number of channels
  view.setUint32(24, sampleRate, true); // Sample rate
  view.setUint32(28, byteRate, true); // Byte rate
  view.setUint16(32, blockAlign, true); // Block align
  view.setUint16(34, bitsPerSample, true); // Bits per sample

  // "data" sub-chunk
  view.setUint32(36, 0x64617461, false); // "data"
  view.setUint32(40, dataSize, true); // Data size

  // Write PCM data
  let offset = 44;
  for (let i = 0; i < pcmData.length; i++, offset += 2) {
    view.setInt16(offset, pcmData[i], true);
  }

  return new Blob([buffer], { type: 'audio/wav' });
}


// --- Gemini API Callers ---

/**
 * Calls the Gemini API for text generation (chat, scenarios).
 * @param {object} systemInstruction - The system prompt.
 * * @param {Array<object>} contents - The chat history/prompt.
 * @param {object} generationConfig - Optional generation config (e..g., for JSON).
 * @returns {Promise<string>} - The generated text.
 */
async function callGeminiText(systemInstruction, contents, generationConfig = {}) {
  // Implement exponential backoff for retries in a real app
  try {
    const payload = {
      contents,
      systemInstruction,
      generationConfig,
    };

    const response = await fetch(GEMINI_TEXT_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let errorBodyText = `API Error: ${response.status} ${response.statusText}`;
      try {
        // Try to get more details from the response body as text
        const text = await response.text();
        if(text) {
          console.error("Gemini API Error Body:", text); // Log the full error body
          errorBodyText = text;
        }
      } catch (e) {
        // Ignore if reading text fails, use status code
      }
      console.error("Gemini API Error:", errorBodyText);
      throw new Error(errorBodyText); // Throw the more descriptive error
    }

    // Read response as text first to avoid empty body errors
    const responseText = await response.text();
    
    // --- FIX: Check for empty or whitespace-only response text ---
    if (!responseText || responseText.trim() === "") {
      console.error("Invalid response structure: Empty response body");
      throw new Error("Invalid response from Gemini API: Empty response.");
    }
    
    const result = JSON.parse(responseText); // Now parse the non-empty text
    
    const candidate = result.candidates?.[0];
    if (candidate && candidate.content?.parts?.[0]?.text) {
      return candidate.content.parts[0].text;
    } else {
      console.error("Invalid response structure:", result);
      throw new Error("Invalid response from Gemini API.");
    }
  } catch (error) {
    // Log the error and re-throw it to be caught by the calling function
    console.error("Failed to call Gemini API:", error);
    throw error;
  }
}

/**
 * Calls the Gemini TTS API.
 * @param {string} text - The text to synthesize.
 * @returns {Promise<{audioData: string, sampleRate: number}>} - Base64 audio data and sample rate.
 */
async function callGeminiTTS(text) {
  try {
    const payload = {
      contents: [{
        parts: [{ text: `Say this clearly: ${text}` }]
      }],
      generationConfig: {
        responseModalities: ["AUDIO"],
      },
      model: "gemini-2.5-flash-preview-tts"
    };

    const response = await fetch(GEMINI_TTS_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      let errorBodyText = `API Error: ${response.status} ${response.statusText}`;
      try {
        // Try to get more details from the response body as text
        const text = await response.text();
        if(text) {
          console.error("Gemini TTS API Error Body:", text); // Log full error body
          errorBodyText = text;
        }
      } catch (e) {
        // Ignore if reading text fails
      }
      console.error("Gemini TTS API Error:", errorBodyText);
      throw new Error(errorBodyText);
    }

    // Read response as text first
    const responseText = await response.text();
    
    // --- FIX: Check for empty or whitespace-only response text ---
    if (!responseText || responseText.trim() === "") {
      console.error("Invalid TTS response structure: Empty response body");
      throw new Error("Invalid TTS response from Gemini API: Empty response.");
    }

    const result = JSON.parse(responseText); // Now parse
    const part = result?.candidates?.[0]?.content?.parts?.[0];
    const audioData = part?.inlineData?.data;
    const mimeType = part?.inlineData?.mimeType;

    if (audioData && mimeType && mimeType.startsWith("audio/L16")) {
      const sampleRateMatch = mimeType.match(/rate=(\d+)/);
      const sampleRate = sampleRateMatch ? parseInt(sampleRateMatch[1], 10) : 24000; // Default 24kHz
      return { audioData, sampleRate };
    } else {
      console.error("Invalid TTS response structure:", result);
      throw new Error("Invalid TTS response from Gemini API.");
    }

  } catch (error) {
    console.error("Failed to call Gemini TTS API:", error);
    throw error;
  }
}


// --- React Components ---

const Icon = ({ name, size = 24, className = "" }) => {
  const icons = {
    home: <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
    book: <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
    chat: <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
    chart: <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
    volume: <path d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
    mic: <path d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
    'message-circle': <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
    'play-circle': <path d="M14.752 11.168l-3.197-2.2132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
    'arrow-left': <path d="M10 19l-7-7m0 0l7-7m-7 7h18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
    'arrow-right': <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
    'chevron-left': <path d="M15 19l-7-7 7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
    'chevron-right': <path d="M9 5l7 7-7 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
    globe: <path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
    download: <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
    bell: <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
    'log-out': <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
    info: <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
    bookmark: <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
    sparkles: <path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
    refresh: <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
    play: <path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
    lightbulb: <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
    'book-open': <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
    flame: <path d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
    // --- NEW ICONS ---
    'card-stack': <path d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h10a2 2 0 002-2v-1a2 2 0 012-2h1.945M3.055 11l-1.423-3.534A1 1 0 012.618 6H21.382a1 1 0 01.986 1.466L20.945 11M3.055 11H20.945m0 0v1a2 2 0 01-2 2H5a2 2 0 01-2-2v-1m17.945 0l-1.423 3.534A1 1 0 0116.382 18H7.618a1 1 0 01-.986-1.466L5.055 13" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
    'check-circle': <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
  };
  return (
    <svg className={className} width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      {icons[name] || icons.home}
    </svg>
  );
};

const TopBar = ({ language, setLanguage, currentScreen, setCurrentScreen }) => {
  const showBackButton = currentScreen !== 'home';

  const handleBack = () => {
    // --- MODIFIED: More intelligent back navigation ---
    if (['flashcards', 'pronunciation-module', 'chat'].includes(currentScreen)) {
      setCurrentScreen('lesson-detail');
    } else if (currentScreen === 'lesson-detail') {
      setCurrentScreen('lesson-list');
    } else if (currentScreen === 'lesson-list') {
      setCurrentScreen('home');
    } else if (currentScreen === 'pronunciation') {
      // This is tricky, it could be from flashcards or module.
      // Defaulting to module is a reasonable choice.
      setCurrentScreen('pronunciation-module');
    }
     else {
      setCurrentScreen('home'); // Default back action
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 h-14 md:h-16 bg-white border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        
        {/* Left Side: Back button or Logo */}
        <div className="flex-1 min-w-0">
          {showBackButton ? (
            <button onClick={handleBack} className="p-2 -ml-2 text-gray-600 hover:text-blue-600">
              <Icon name="arrow-left" size={24} />
            </button>
          ) : (
            <div className="text-xl md:text-2xl font-bold text-blue-600">CYJNA</div>
          )}
        </div>
        
        {/* Center Title: Only if back button is present */}
        {showBackButton && (
           <div className="text-xl md:text-2xl font-bold text-blue-600 absolute left-1/2 -translate-x-1/2">CYJNA</div>
        )}

        {/* Right Side: Language and Profile */}
        <div className="flex-1 min-w-0 flex items-center justify-end gap-4">
          <button onClick={() => setLanguage(language === 'EN' ? '中文' : 'EN')} className="px-3 py-1 text-sm font-semibold border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50">
            {language === 'EN' ? '中文' : 'EN'}
          </button>
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">U</div>
        </div>
      </div>
    </div>
  );
};

const BottomNav = ({ currentScreen, setCurrentScreen }) => {
  const navItems = [
    { id: 'home', icon: 'home', label: 'Home' },
    { id: 'lesson-list', icon: 'book', label: 'Lessons' }, // MODIFIED: Points to lesson-list
    { id: 'chat', icon: 'chat', label: 'Chat' },
    { id: 'progress', icon: 'chart', label: 'Progress' }
  ];
  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 z-50">
      <div className="max-w-7xl mx-auto h-full flex items-center justify-around">
        {navItems.map(item => (
          <button 
            key={item.id} 
            onClick={() => {
              // Special handling for 'Chat' button to reset lesson context
              if (item.id === 'chat') {
                // We'll handle this in the App component, this just sets the screen
                setCurrentScreen('chat-main'); // Use a new id to signify 'general chat'
              } else {
                setCurrentScreen(item.id);
              }
            }} 
            className={`flex flex-col items-center justify-center gap-1 min-w-[60px] 
              ${(currentScreen === item.id || 
                 (item.id === 'lesson-list' && ['lesson-detail', 'flashcards', 'pronunciation-module'].includes(currentScreen)) ||
                 (item.id === 'chat' && currentScreen === 'chat')
              ) ? 'text-blue-600' : 'text-gray-500'}`}
            >
            <Icon name={item.icon} size={24} />
            <span className={`text-xs ${currentScreen === item.id ? 'font-semibold' : ''}`}>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

const HomeScreen = ({ setCurrentScreen, completedLessonIds, recentActivity }) => {
  // --- MODIFIED: Dynamic Progress Bar ---
  const totalLessons = 5; // MODIFIED: Increased total lessons
  const lessonsCompleted = completedLessonIds.length;
  const progressPercent = (lessonsCompleted / totalLessons) * 100;

  return (
    <div className="min-h-screen bg-gray-100 pt-14 pb-16 md:pt-16">
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <div className="mb-6 md:mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Learn English for your deliveries.</h1>
          <p className="text-base md:text-lg text-gray-600">Practice real phrases you'll use every day.</p>
        </div>
        <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Today's progress</span>
            <span className="text-sm font-semibold text-blue-600">{lessonsCompleted} / {totalLessons} lessons</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full" style={{width: `${progressPercent}%`}}></div>
          </div>
        </div>
        {/* --- MODIFIED: Removed tiles --- */}
        <div className="grid grid-cols-1 gap-4 mb-8">
          <button onClick={() => setCurrentScreen('lesson-list')} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow text-left">
            <Icon name="play-circle" size={32} className="text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Continue lesson</h3>
            <p className="text-sm text-gray-600">
              {/* MODIFIED: Dynamic lesson text */}
              {lessonsCompleted < totalLessons ? `Start Lesson ${lessonsCompleted + 1}` : 'All complete!'}
            </p>
          </button>
        </div>
        {/* --- END MODIFICATION --- */}

        {/* --- MODIFIED: Dynamic Recent Activity --- */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <span className="text-sm text-gray-700">{activity.text}</span>
                  <span className="text-xs text-gray-500">{activity.time}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No recent activity yet. Start a lesson!</p>
            )}
          </div>
        </div>
        {/* --- END MODIFICATION --- */}
      </div>
    </div>
  );
};

// --- RENAMED: from LessonsScreen to FlashcardScreen ---
const FlashcardScreen = ({ setCurrentScreen, setPronunciationPhrase, currentLesson }) => {
  const [currentPhrase, setCurrentPhrase] = useState(0);
  const [saved, setSaved] = useState(false);
  const [isListening, setIsListening] = useState(false); // State for TTS loading
  const [audioError, setAudioError] = useState(null);

  // --- MODIFIED: Get phrases from currentLesson prop ---
  const phrases = currentLesson?.phrases && currentLesson.phrases.length > 0 ? currentLesson.phrases : [
    { id: 1, en: "No lesson selected.", translation: "请选择一个课程。", phonetic: "Qǐng xuǎnzé yīgè kèchéng.", category: "General", context: "Go back to the lessons list to select a lesson." },
  ];

  const phrase = phrases[currentPhrase] || phrases[0]; // Fallback
  const totalPhrases = phrases.length;

  /**
   * Handle the "Listen" button click.
   */
  const handleListen = async () => {
    if (isListening) return;
    setIsListening(true);
    setAudioError(null);
    try {
      const { audioData, sampleRate } = await callGeminiTTS(phrase.en);
      const pcmData = new Int16Array(base64ToArrayBuffer(audioData));
      const wavBlob = pcmToWav(pcmData, sampleRate);
      const audioUrl = URL.createObjectURL(wavBlob);
      
      const audio = new Audio(audioUrl);
      audio.play();
      
      audio.onended = () => {
        setIsListening(false);
        URL.revokeObjectURL(audioUrl);
      };
      audio.onerror = () => {
        setIsListening(false);
        setAudioError("Failed to play audio.");
        URL.revokeObjectURL(audioUrl);
      };

    } catch (error) {
      console.error("TTS failed:", error);
      // --- UPDATED FIX: Check for 401 ---
      if (error.message && (error.message.includes("401") || error.message.toLowerCase().includes("unauthorized"))) {
        setAudioError("Authentication failed (Error 401). This environment's API key is missing or invalid.");
      } else {
        setAudioError("Audio failed to load. Please try again.");
      }
      // --- END UPDATED FIX ---
      setIsListening(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 pt-14 pb-16 md:pt-16">
      {/* Category bar removed, as it's now per-lesson */}
      <div className="max-w-2xl mx-auto p-4 md:p-6">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm text-gray-600">Phrase {currentPhrase + 1} of {totalPhrases}</span>
          <div className="flex gap-1">
            {Array.from({ length: totalPhrases }).map((_, i) => (
              <div key={i} className={`w-2 h-2 rounded-full ${i === currentPhrase ? 'bg-blue-600' : 'bg-gray-300'}`} />
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg mb-6">
          <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 text-sm font-semibold rounded-full mb-4">{phrase.category || 'Personalized'}</span>
          <div className="mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">{phrase.en}</h2>
            <p className="text-lg text-gray-600">{phrase.translation}</p>
            {/* Display new phonetic guide */}
            {phrase.phonetic && (
              <p className="text-lg text-blue-600 mt-1">{phrase.phonetic}</p>
            )}
          </div>
          <div className="bg-gray-50 rounded-lg p-4 mb-6 flex items-start gap-3">
            <Icon name="info" size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-700">{phrase.context}</p>
          </div>
          <button 
            onClick={handleListen} 
            disabled={isListening}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 mb-4 disabled:bg-blue-400"
          >
            {isListening ? (
              <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Icon name="volume" size={24} />
            )}
            <span>{isListening ? 'Loading...' : 'Listen'}</span>
          </button>
          {audioError && <p className="text-center text-red-500 text-sm mb-4">{audioError}</p>}
          <div className="space-y-3">
            <button onClick={() => setSaved(!saved)} className="w-full border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-semibold py-3 rounded-xl flex items-center justify-center gap-2">
              <Icon name="bookmark" size={20} />
              <span>{saved ? 'Saved' : 'Save for offline'}</span>
              {saved && <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">Offline</span>}
            </button>
            <button onClick={() => { setPronunciationPhrase(phrase); setCurrentScreen('pronunciation'); }} className="w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-3 rounded-xl flex items-center justify-center gap-2">
              <Icon name="mic" size={20} />
              <span>Practice pronunciation</span>
            </button>
          </div>
        </div>
        <div className="flex gap-4">
          <button onClick={() => setCurrentPhrase(Math.max(0, currentPhrase - 1))} disabled={currentPhrase === 0} className={`flex-1 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 ${currentPhrase === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
            <Icon name="chevron-left" size={20} />
            <span>Previous</span>
          </button>
          <button onClick={() => setCurrentPhrase(Math.min(totalPhrases - 1, currentPhrase + 1))} disabled={currentPhrase === totalPhrases - 1} className={`flex-1 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 ${currentPhrase === totalPhrases - 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
            <span>Next</span>
            <Icon name="chevron-right" size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

// --- NEW COMPONENT: LessonListScreen ---
const LessonListScreen = ({ learningPlan, setCurrentScreen, setCurrentLesson }) => {
  // --- MODIFIED: Split 50 phrases into 5 lessons ---
  const lessons = [];
  const phrasesPerLesson = 10;
  const totalLessons = 5;
  const lessonTitles = [
      "Lesson 1: Getting Started",
      "Lesson 2: Common Interactions",
      "Lesson 3: Building Confidence",
      "Lesson 4: Advanced Scenarios",
      "Lesson 5: Industry Specific"
  ];

  for (let i = 0; i < totalLessons; i++) {
    const start = i * phrasesPerLesson;
    const end = start + phrasesPerLesson;
    const lessonPhrases = learningPlan.slice(start, end);
    
    lessons.push({
      id: `lesson${i + 1}`,
      title: lessonTitles[i] || `Lesson ${i + 1}`,
      phrases: lessonPhrases,
      phraseCount: lessonPhrases.length
    });
  }
  // --- END MODIFICATION ---

  const handleLessonSelect = (lesson) => {
    setCurrentLesson(lesson);
    setCurrentScreen('lesson-detail');
  };

  return (
    <div className="min-h-screen bg-gray-100 pt-14 pb-16 md:pt-16">
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Your Lessons</h1>
        <div className="space-y-4">
          {lessons.map((lesson) => (
            <button 
              key={lesson.id} 
              onClick={() => handleLessonSelect(lesson)} 
              className="w-full bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow text-left flex items-center justify-between"
              disabled={lesson.phrases.length === 0}
            >
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-1">{lesson.title}</h2>
                <p className="text-sm text-gray-600">{lesson.phraseCount} phrases</p>
              </div>
              <Icon name="chevron-right" size={24} className="text-gray-400" />
            </button>
          ))}
          {learningPlan.length === 0 && (
            <p className="text-gray-600 text-center">Your lesson plan is empty. Please try re-onboarding to generate one.</p>
          )}
        </div>
      </div>
    </div>
  );
};

// --- NEW COMPONENT: LessonDetailScreen ---
const LessonDetailScreen = ({ currentLesson, setCurrentScreen, completedLessonIds, setCompletedLessonIds, setRecentActivity }) => {
  if (!currentLesson) {
    return (
      <div className="min-h-screen bg-gray-100 pt-14 pb-16 md:pt-16 flex items-center justify-center">
        <p>No lesson selected. Go back to the lesson list.</p>
      </div>
    );
  }

  const isCompleted = completedLessonIds.includes(currentLesson.id);

  const handleMarkComplete = () => {
    if (isCompleted) return; // Prevent duplicate additions
    setCompletedLessonIds(ids => [...new Set([...ids, currentLesson.id])]);
    // --- NEW: Add to recent activity ---
    setRecentActivity(prevActivity => [
      { id: Date.now(), text: `Completed ${currentLesson.title}`, time: 'Just now' },
      ...prevActivity.slice(0, 4) // Keep only the 5 most recent
    ]);
  };

  const modules = [
    { id: 'flashcards', title: 'Flash Cards', icon: 'card-stack', description: 'Review words and phrases', screen: 'flashcards' },
    { id: 'pronunciation', title: 'Pronunciation Practice', icon: 'mic', description: 'Practice speaking each phrase', screen: 'pronunciation-module' },
    { id: 'chat', title: 'Practice Chat', icon: 'chat', description: 'Use phrases in a real chat', screen: 'chat' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 pt-14 pb-16 md:pt-16">
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{currentLesson.title}</h1>
        <p className="text-lg text-gray-600 mb-6">{currentLesson.phrases.length} phrases to master</p>
        
        <div className="space-y-4 mb-8">
          {modules.map(module => (
            <button
              key={module.id}
              onClick={() => setCurrentScreen(module.screen)}
              className="w-full bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow text-left flex items-center gap-5"
            >
              <div className="flex-shrink-0 w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                <Icon name={module.icon} size={28} className="text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{module.title}</h2>
                <p className="text-sm text-gray-600">{module.description}</p>
              </div>
              <Icon name="chevron-right" size={24} className="text-gray-400 ml-auto" />
            </button>
          ))}
        </div>
        
        <button
          onClick={handleMarkComplete}
          disabled={isCompleted}
          className="w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          <Icon name="check-circle" size={20} />
          <span>{isCompleted ? 'Lesson Completed!' : 'Mark as Complete'}</span>
        </button>
      </div>
    </div>
  );
};

// --- NEW COMPONENT: PronunciationModuleScreen ---
const PronunciationModuleScreen = ({ currentLesson, setCurrentScreen, setPronunciationPhrase }) => {
  if (!currentLesson) {
    return (
      <div className="min-h-screen bg-gray-100 pt-14 pb-16 md:pt-16 flex items-center justify-center">
        <p>No lesson selected. Go back to the lesson list.</p>
      </div>
    );
  }
  
  const phrases = currentLesson.phrases;

  const handlePhraseSelect = (phrase) => {
    setPronunciationPhrase(phrase);
    setCurrentScreen('pronunciation');
  };

  return (
    <div className="min-h-screen bg-gray-100 pt-14 pb-16 md:pt-16">
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{currentLesson.title}</h1>
        <p className="text-lg text-gray-600 mb-6">Pronunciation Practice</p>
        
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {phrases.map((phrase, index) => (
              <li key={index}>
                <button 
                  onClick={() => handlePhraseSelect(phrase)} 
                  className="w-full p-4 text-left hover:bg-gray-50 flex items-center justify-between"
                >
                  <div>
                    <p className="text-base font-semibold text-gray-900">{phrase.en}</p>
                    <p className="text-sm text-gray-600">{phrase.translation}</p>
                  </div>
                  <Icon name="mic" size={20} className="text-blue-600" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};


const ChatScreen = ({ userPersona, currentLesson, setRecentActivity }) => {
  const [initialScenario, setInitialScenario] = useState({
    title: 'LATE DELIVERY',
    customer_line: 'Can you wait 5 minutes?',
    hint: '提示: 你可以说 "Yes, no problem" 或 "Sorry, I have another delivery"'
  });
  
  const [messages, setMessages] = useState([
    { type: 'ai', text: initialScenario.customer_line, hint: initialScenario.hint, time: '2:45 PM' }
  ]);
  const [inputText, setInputText] = useState('');
  const [recordingState, setRecordingState] = useState('idle');
  const [timer, setTimer] = useState(0);
  const [isAiResponding, setIsAiResponding] = useState(false);
  const [isGeneratingScenario, setIsGeneratingScenario] = useState(false);
  const [chatError, setChatError] = useState(null);

  // --- MODIFIED ---
  const industry = userPersona?.targetIndustry || 'delivery';
  const city = userPersona?.targetCity || 'a major US city';
  // --- NEW: Get lesson context ---
  const lessonPhrases = currentLesson?.phrases?.map(p => p.en).join(', ') || null;
  
  // System prompt for the AI customer, now with industry and persona context
  const customerSystemPrompt = {
    parts: [{ text: `You are an AI practice partner. The user is practicing English for the '${industry}' industry in '${city}'. 
    Your role is to act as a person the user would interact with in that industry. 
    - If the industry is 'delivery', act as a customer receiving a delivery.
    - If the industry is 'hospitality', act as a hotel guest or manager.
    - If the industry is 'tech', act as a co-worker or manager.
    - Otherwise, act as a general customer or co-worker appropriate for the '${industry}' industry.
    
    This is the user's persona: ${JSON.stringify(userPersona)}.
    Use this persona to inform your interaction (e.g., be patient if they are a beginner, use simple words).
    
    IMPORTANT: Also, use the user's 'targetCity' (${city}) to include region-specific slang in your replies naturally. For example, if in New York, you might say '...the soda is on the counter' instead of 'pop'. If in Boston, you might say 'That's wicked cool.'
    
    ${lessonPhrases ? `LESSON CONTEXT: The user is currently learning these phrases: [${lessonPhrases}]. If possible, naturally create situations where the user can use one of these phrases.` : ''}

    Your name is Alex. Respond to the user's replies concisely and naturally. 
    Sometimes introduce small, common complications relevant to the industry.
    Keep your replies to 1-2 sentences. Do not act as the user.` }]
  };
  
  // --- FIX ---
  // System prompt for the scenario generator (ROLE)
  const scenarioGeneratorSystemPrompt = {
    parts: [{ text: "You are a scenario generator for an English learning app. You only respond in perfect JSON." }]
  };
  
  // The actual prompt (TASK) - NOW DYNAMIC BASED ON INDUSTRY
  const scenarioGeneratorPrompt = `Generate a new, brief scenario for a user practicing English in the '${industry}' industry in '${city}'. 
  The output must be a JSON object with this exact structure: \`{\"title\": \"SCENARIO TITLE\", \"customer_line\": \"The first line from the person the user is interacting with.\"}\`.
  Example for 'delivery' in 'New York': \`{\"title\": \"WRONG SODA\", \"customer_line\": \"Hi, I ordered a Coke, but this is a Pepsi.\"}\`.
  Example for 'hospitality': \`{\"title\": \"CHECK-IN ISSUE\", \"customer_line\": \"Hi, I have a reservation but I can't find it.\"}\`.
  Ensure the title is uppercase.`;
  // --- END FIX ---

  useEffect(() => {
    let interval;
    if (recordingState === 'recording') {
      interval = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [recordingState]);
  
  // --- NEW: Reset chat if lesson context changes ---
  useEffect(() => {
    // If a lesson is passed, this is a lesson chat.
    // If currentLesson is null, it's a general chat.
    // This effect will reset the chat when the user switches.
    const chatTitle = currentLesson ? `Lesson: ${currentLesson.title}` : `General: ${initialScenario.title}`;
    const firstMessage = currentLesson ? 'Hi there! Let\'s practice what you just learned.' : initialScenario.customer_line;
    
    setMessages([
      { type: 'ai', text: firstMessage, time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) }
    ]);
  }, [currentLesson, initialScenario]);


  /**
   * Formats the message history for the Gemini API.
   */
  const formatChatHistory = (msgs) => {
    return msgs.map(msg => ({
      role: msg.type === 'ai' ? 'model' : 'user',
      parts: [{ text: msg.text.split('\n')[0] }] // Remove hint from AI text
    }));
  };

  /**
   * Handles sending a user message.
   */
  const sendMessage = () => {
    if (inputText.trim() && !isAiResponding) {
      const newUserMessage = { 
        type: 'user', 
        text: inputText, 
        time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) 
      };
      
      const newMessages = [...messages, newUserMessage];
      setMessages(newMessages);
      setInputText('');
      setChatError(null);
      
      // Get AI response
      getAiResponse(newMessages);
    }
  };

  /**
   * Fetches a response from the Gemini AI and its translation.
   */
  const getAiResponse = async (currentMessages) => {
    setIsAiResponding(true);
    try {
      // 1. Get AI response in English
      const chatHistory = formatChatHistory(currentMessages);
      const aiText = await callGeminiText(customerSystemPrompt, chatHistory);

      // 2. Get translation of the AI response
      let translatedText = null;
      try {
        const translationSystemPrompt = { parts: [{ text: `Translate the following text to ${userPersona.nationality || 'Mandarin (Simplified Chinese)'}. Only output the translation.` }] };
        const translationContents = [{ role: 'user', parts: [{ text: aiText }] }];
        translatedText = await callGeminiText(translationSystemPrompt, translationContents);
      } catch (translationError) {
        console.error("Failed to translate AI response:", translationError);
        // Fail silently, we'll just show the English text
      }

      // 3. Add to messages
      setMessages(prev => [...prev, { 
        type: 'ai', 
        text: aiText, 
        translation: translatedText, // Add the translation
        time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) 
      }]);
    } catch (error) {
      // --- UPDATED FIX: Check for 401 ---
      if (error.message && (error.message.includes("401") || error.message.toLowerCase().includes("unauthorized"))) {
        setChatError("Authentication failed (Error 401). This environment's API key is missing or invalid.");
      } else {
        setChatError("The AI failed to respond. Please try again.");
      }
      // --- END UPDATED FIX ---
    } finally {
      setIsAiResponding(false);
    }
  };

  /**
   * Generates a new chat scenario.
   */
  const getNewScenario = async () => {
    if (isGeneratingScenario || currentLesson) return; // Don't generate new scenario if in lesson mode
    setIsGeneratingScenario(true);
    setChatError(null);
    try {
      const jsonConfig = {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            "title": { "type": "STRING" },
            "customer_line": { "type": "STRING" }
          },
          required: ["title", "customer_line"]
        }
      };

      // --- FIX ---
      // Create contents array with the prompt
      const contents = [{ role: 'user', parts: [{ text: scenarioGeneratorPrompt }] }];
      const responseText = await callGeminiText(scenarioGeneratorSystemPrompt, contents, jsonConfig);
      // --- END FIX ---

      const newScenario = JSON.parse(responseText);

      setInitialScenario(newScenario);
      // --- NEW: Add to recent activity ---
      setRecentActivity(prevActivity => [
        { id: Date.now(), text: `Started chat: ${newScenario.title}`, time: 'Just now' },
        ...prevActivity.slice(0, 4)
      ]);
    } catch (error) {
      // --- UPDATED FIX: Check for 401 ---
      if (error.message && (error.message.includes("401") || error.message.toLowerCase().includes("unauthorized"))) {
        setChatError("Authentication failed (Error 401). This environment's API key is missing or invalid.");
      } else {
        setChatError("Failed to generate a new scenario. Please try again.");
      }
      // --- END UPDATED FIX ---
    } finally {
      setIsGeneratingScenario(false);
    }
  };

  const formatTime = (seconds) => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  
  return (
    <div className="min-h-screen bg-gray-100 pt-14 pb-32 md:pt-16 flex flex-col">
      <div className="bg-blue-50 border-b border-blue-100 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
              {currentLesson ? `LESSON: ${currentLesson.title}` : initialScenario.title}
            </span>
            {/* Only show "New Scenario" button if NOT in a lesson chat */}
            {!currentLesson && (
              <button 
                onClick={getNewScenario} 
                disabled={isGeneratingScenario || isAiResponding}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-blue-600 text-blue-600 rounded-lg text-xs font-semibold hover:bg-blue-50 disabled:opacity-50"
              >
                {isGeneratingScenario ? (
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Icon name="refresh" size={14} />
                )}
                <span>{isGeneratingScenario ? 'Generating...' : 'New Scenario ✨'}</span>
              </button>
            )}
          </div>
          <p className="text-base text-gray-800 mt-1">Practice Partner: "{messages[0].text.split('\n')[0]}"</p>
          <div className="flex items-center gap-1 mt-2 text-xs text-gray-600">
            <Icon name="sparkles" size={12} />
            <span>
              {currentLesson ? `Practice using your lesson phrases!` : `AI-powered chat scenarios for ${industry}`}
            </span>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] ${msg.type === 'user' ? 'bg-blue-600 text-white' : 'bg-white text-gray-900'} rounded-2xl px-4 py-3 shadow-sm`}>
                <p className="text-base">{msg.text}</p>
                {/* Show translation if it exists */}
                {msg.translation && (
                  <p className="text-base font-light text-gray-700 mt-2 pt-2 border-t border-gray-200">
                    {msg.translation}
                  </p>
                )}
                {/* Show hint if it exists (for first message) */}
                {msg.hint && (
                  <p className="text-xs text-gray-600 mt-2 pt-2 border-t border-gray-200">
                    {msg.hint}
                  </p>
                )}
                <span className={`text-xs mt-1 block ${msg.type === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>{msg.time}</span>
              </div>
            </div>
          ))}
          {isAiResponding && (
            <div className="flex justify-start">
              <div className="bg-white text-gray-900 rounded-2xl px-4 py-3 shadow-sm flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{animationDelay: '0s'}}></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
              </div>
            </div>
          )}
          {chatError && (
            <div className="text-center text-red-500 text-sm">{chatError}</div>
          )}
        </div>
      </div>
      <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200 px-4 py-4 shadow-lg">
        <div className="max-w-4xl mx-auto">
          {recordingState === 'idle' && (
            <>
              <textarea value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="Type your reply in English…" rows={2} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl resize-none focus:outline-none focus:border-blue-500" onKeyPress={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }}} />
              <div className="flex gap-3 mt-3">
                <button onClick={() => { setRecordingState('recording'); setTimer(0); }} className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center">
                  <Icon name="mic" size={24} className="text-gray-700" />
                </button>
                <button onClick={sendMessage} disabled={isAiResponding} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl disabled:bg-blue-400">
                  {isAiResponding ? '...' : 'Send'}
                </button>
              </div>
            </>
          )}
          {recordingState === 'recording' && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-lg font-semibold">{formatTime(timer)}</span>
              </div>
              <button onClick={() => { setRecordingState('processing'); setTimeout(() => { setRecordingState('idle'); setInputText('Yes, I can wait.'); }, 1500); }} className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl">Stop</button>
            </div>
          )}
          {recordingState === 'processing' && (
            <div className="flex items-center justify-center gap-3 py-4">
              <div className="w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-700">Converting speech...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const PronunciationScreen = ({ phraseData, userPersona, setCurrentScreen, setRecentActivity }) => {
  const [micState, setMicState] = useState('idle'); // idle, recording, processing, result
  const [score, setScore] = useState(null);
  const [timer, setTimer] = useState(0);
  const [recognition, setRecognition] = useState(null); // SpeechRecognition instance
  const [transcript, setTranscript] = useState("");
  const [improvementTip, setImprovementTip] = useState("");
  const [analysisError, setAnalysisError] = useState(null);

  const phrase = phraseData || { en: "Can you wait 5 minutes?", translation: "你能等5分钟吗？", phonetic: "Nǐ néng děng 5 fēnzhōng ma?" };

  // --- Initialize SpeechRecognition ---
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
      analyzePronunciation(userTranscript); // Analyze after getting result
    };

    rec.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setAnalysisError("Speech recognition failed. Please try again.");
      setMicState('idle');
    };

    rec.onend = () => {
      // Automatically move to processing if recording was active
      if (micState === 'recording') {
        setMicState('processing');
      }
    };

    setRecognition(rec);
  }, []); // Run only once

  // --- Timer ---
  useEffect(() => {
    let interval;
    if (micState === 'recording') {
      interval = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [micState]);

  // --- Analysis Function ---
  const analyzePronunciation = async (userTranscript) => {
    setMicState('processing');
    setAnalysisError(null);

    // --- MODIFIED ---
    // System prompt now includes the user's persona for better tips
    const systemPrompt = {
      parts: [{ text: `You are a pronunciation coach. The user is practicing an English phrase.
      The user's persona is: ${JSON.stringify(userPersona)}.
      Their native language is ${userPersona.nationality}. Use this knowledge to give better, more specific tips (e.g., "Mandarin speakers often struggle with 'th'...").
      
      IMPORTANT: Be aware of the user's 'targetCity' (${userPersona.targetCity}). If the user uses a valid regional word (e.g., 'soda' for 'pop' in NYC), do not mark it as incorrect.
      
      Compare the target phrase to the user's attempt.
      Provide a response in this exact JSON format:
      {
        "score": <an integer score from 0-100, where 100 is perfect>,
        "tip": "<a single, concise, and actionable tip for improvement. If it's good, say what they did well.>"
      }
      
      Example (if user is Mandarin speaker):
      - If target is "I'll be right there" and user said "I be right there", respond:
      {"score": 70, "tip": "Good effort! You missed the 'll' sound in 'I'll'. Try to say 'I will' contracted."}
      - If target is "The food is cold" and user said "Ze food is cold", respond:
      {"score": 80, "tip": "You're close! As a Mandarin speaker, the 'th' sound can be tricky. Try placing your tongue between your teeth for 'the'."}`
      }]
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
      
      // --- FIX: Check for empty string from analysis ---
      if (!responseText || responseText.trim() === "") {
        console.error("Gemini analysis returned an empty string.");
        throw new Error("Analysis failed: AI returned an empty response.");
      }
      // --- END FIX ---

      const analysis = JSON.parse(responseText);
      
      setScore(analysis.score);
      setImprovementTip(analysis.tip);
      setMicState('result');
      
      // --- NEW: Add to recent activity ---
      setRecentActivity(prevActivity => [
        { id: Date.now(), text: `Pronunciation score: ${analysis.score}/100`, time: 'Just now' },
        ...prevActivity.slice(0, 4)
      ]);

    } catch (error) {
      console.error("Gemini analysis failed:", error);
      // --- UPDATED FIX: Check for 401 ---
      if (error.message && (error.message.includes("401") || error.message.toLowerCase().includes("unauthorized"))) {
        setAnalysisError("Authentication failed (Error 401). This environment's API key is missing or invalid.");
      } else {
        setAnalysisError("Failed to analyze pronunciation. Please try again.");
      }
      // --- END UPDATED FIX ---
      setMicState('idle'); // Reset on failure
    }
  };

  // --- Control Handlers ---
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
      recognition.stop(); // This will trigger onend -> onresult -> analyzePronunciation
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
          
          {/* IDLE STATE */}
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
          
          {/* RECORDING STATE */}
          {micState === 'recording' && (
            <div className="text-center">
              <div className="text-3xl font-semibold text-gray-900 mb-8">{formatTime(timer)}</div>
              <p className="text-sm text-gray-600 mb-8">Recording...</p>
              <button onClick={handleStopRecording} className="px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl">Stop</button>
            </div>
          )}
          
          {/* PROCESSING STATE */}
          {micState === 'processing' && (
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-6"></div>
              <p className="text-lg text-gray-700">Analyzing pronunciation...</p>
              {transcript && <p className="text-sm text-gray-500 mt-2">Heard: "{transcript}"</p>}
            </div>
          )}
          
          {/* RESULT STATE */}
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
                  onClick={() => setCurrentScreen('lesson-detail')} // MODIFIED: Go back to lesson detail
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

const ProgressScreen = () => {
  const weekData = [{ day: 'Mon', value: 15 }, { day: 'Tue', value: 22 }, { day: 'Wed', value: 18 }, { day: 'Thu', value: 25 }, { day: 'Fri', value: 20 }, { day: 'Sat', value: 12 }, { day: 'Sun', value: 0 }];
  const maxValue = Math.max(...weekData.map(d => d.value));
  return (
    <div className="min-h-screen bg-gray-100 pt-14 pb-16">
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">U</div>
          <h2 className="text-xl font-semibold text-gray-900">Welcome back!</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: 'book-open', value: 12, label: 'Phrases completed', color: 'text-blue-500' },
            { icon: 'message-circle', value: 5, label: 'Chats practiced', color: 'text-green-500' },
            { icon: 'mic', value: 8, label: 'Pronunciation', color: 'text-purple-500' },
            { icon: 'flame', value: 7, label: 'Day streak', color: 'text-orange-500', highlight: true }
          ].map((stat, i) => (
            <div key={i} className={`bg-white rounded-xl p-6 shadow-sm text-center ${stat.highlight ? 'border-2 border-orange-500' : ''}`}>
              <Icon name={stat.icon} size={32} className={`${stat.color} mx-auto mb-3`} />
              <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600 mb-1">{stat.label}</div>
              <div className="text-xs text-gray-500">{stat.highlight ? <span className="text-green-600 font-semibold">Keep it up!</span> : 'Today'}</div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">This week</h3>
          <div className="flex items-end justify-between h-40 gap-2">
            {weekData.map((data, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center">
                <div className="w-full bg-gray-100 rounded-t-lg relative" style={{height: '100%'}}>
                  <div className={`absolute bottom-0 w-full rounded-t-lg ${idx === 5 ? 'bg-blue-600' : 'bg-blue-400'}`} style={{height: `${(data.value / maxValue) * 100}%`}} />
                </div>
                <span className="text-xs text-gray-600 mt-2">{data.day}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 text-center mt-4">Phrases practiced per day</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Settings</h3>
          </div>
          {[
            { icon: 'globe', title: 'Language', value: 'English' },
            { icon: 'download', title: 'Offline lessons', value: '5 lessons', badge: 'Offline' },
            { icon: 'bell', title: 'Notifications', value: 'Enabled' }
          ].map((item, i) => (
            <button key={i} className="w-full px-6 py-4 flex items-center justify-between border-b border-gray-200 hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <Icon name={item.icon} size={20} className="text-gray-600" />
                <div className="text-left">
                  <div className="text-sm font-semibold text-gray-900">{item.title}</div>
                  <div className="text-xs text-gray-600">{item.value}</div>
                </div>
              </div>
              {item.badge ? <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">{item.badge}</span> : <Icon name="chevron-right" size={20} className="text-gray-400" />}
            </button>
          ))}
          <button className="w-full px-6 py-4 flex items-center hover:bg-red-50">
            <Icon name="log-out" size={20} className="text-red-500 mr-3" />
            <span className="text-sm font-semibold text-red-500">Log out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Onboarding Screen 1 ---
const OnboardingScreen = ({ setCurrentScreen }) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = () => {
    // In a real app, you'd validate and send this to a server
    // For this demo, we just move to the next step
    if (phone && password) {
      setCurrentScreen('onboarding-step-2'); // Go to step 2
    } else {
      // Don't use alert()
      console.error('Please fill in both fields.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-2">Welcome to CYJNA</h2>
        <p className="text-base text-gray-600 text-center mb-8">Create your account to start learning.</p>
        
        <div className="space-y-6">
          <div>
            <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter your phone number"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
              Set Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a strong password"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
            />
          </div>
          
          <button 
            onClick={handleSignUp} 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl shadow-md transition-colors"
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
};
// --- End of Onboarding Screen 1 ---


// --- MODIFIED: Onboarding Screen 2 (New Fields) ---
const OnboardingStepTwoScreen = ({ onCompleteOnboarding, setCurrentScreen }) => {
  const [formData, setFormData] = useState({
    age: '',
    nationality: 'Chinese',
    englishLevel: 'beginner',
    yearsInUS: '0-1',
    education: 'high-school',
    currentIndustry: 'delivery',
    targetIndustry: 'delivery',
    targetCity: 'New York'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleContinue = () => {
    // In a real app, save this data
    console.log("User Persona:", formData);
    onCompleteOnboarding(formData); // Pass all data up to App
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 relative">
      <button 
        onClick={() => setCurrentScreen('onboarding')} // Added setCurrentScreen prop
        className="absolute top-6 left-6 p-2 text-gray-600 hover:text-blue-600 z-10"
      >
        <Icon name="arrow-left" size={24} />
      </button>

      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 pt-16 md:pt-8">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-2">Tell Us About Yourself</h2>
        <p className="text-base text-gray-600 text-center mb-8">This helps us personalize your lessons.</p>
        
        <div className="space-y-4">
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Age</label>
              <input type="number" name="age" value={formData.age} onChange={handleChange} placeholder="e.g., 25" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 bg-white" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Nationality</label>
              <input type="text" name="nationality" value={formData.nationality} onChange={handleChange} placeholder="e.g., Chinese" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 bg-white" />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Current English Level</label>
            <select name="englishLevel" value={formData.englishLevel} onChange={handleChange} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 bg-white">
              <option value="beginner">Beginner (Just starting)</option>
              <option value="intermediate">Intermediate (Can have simple conversations)</option>
              <option value="advanced">Advanced (Fluent)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Years in the US</label>
            <select name="yearsInUS" value={formData.yearsInUS} onChange={handleChange} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 bg-white">
              <option value="0-1">Less than 1 year</option>
              <option value="1-3">1-3 years</option>
              <option value="3+">More than 3 years</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Education Level</label>
            <select name="education" value={formData.education} onChange={handleChange} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 bg-white">
              <option value="high-school">High School</option>
              <option value="college">College</option>
              <option value="graduate">Graduate Degree</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Current Industry</label>
              <input type="text" name="currentIndustry" value={formData.currentIndustry} onChange={handleChange} placeholder="e.g., Delivery" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 bg-white" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Target Industry</label>
              <input type="text" name="targetIndustry" value={formData.targetIndustry} onChange={handleChange} placeholder="e.g., Hospitality" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 bg-white" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Target City</label>
            <input type="text" name="targetCity" value={formData.targetCity} onChange={handleChange} placeholder="e.g., New York" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 bg-white" />
          </div>
          
          <button 
            onClick={handleContinue} 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl shadow-md transition-colors mt-6"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};
// --- End of New Screen 2 ---

// --- NEW: Learning Plan Generation Screen ---
const LearningPlanScreen = ({ userPersona, onPlanGenerated }) => {
  const [status, setStatus] = useState('generating'); // generating, error
  const [error, setError] = useState(null);

  useEffect(() => {
    const generatePlan = async () => {
      // Use "Chinese" to determine the language for translation/phonetics
      // This is a simplification. A real app would use a language code.
      const isMandarinSpeaker = userPersona.nationality?.toLowerCase().includes('chinese');
      const targetLanguage = isMandarinSpeaker ? "Mandarin (Simplified Chinese)" : userPersona.nationality;
      const phoneticGuide = isMandarinSpeaker ? "Mandarin Pinyin" : "phonetic transliteration";

      // --- FIX: Define the system role ---
      const systemPrompt = {
        parts: [{ text: `You are an ESL curriculum planner for a language learning app. You respond in perfect JSON.`}]
      };
      
      // --- FIX: Define the user's prompt (the actual task) ---
      const userPrompt = `Generate the user's first 50 vocabulary words and phrases based on their persona.
        
        USER PERSONA:
        - Age: ${userPersona.age}
        - Nationality: ${userPersona.nationality}
        - Native Language: ${targetLanguage}
        - English Level: ${userPersona.englishLevel}
        - Years in US: ${userPersona.yearsInUS}
        - Education: ${userPersona.education}
        - Current Industry: ${userPersona.currentIndustry}
        - Target Industry: ${userPersona.targetIndustry}
        - Target City: ${userPersona.targetCity}

        The user's target language for translation is: ${targetLanguage}.
        
        IMPORTANT: Use the 'Target City' (${userPersona.targetCity}) to include region-specific vocabulary or slang where appropriate. For example, if the city is New York, use 'soda' instead of 'pop'. If the city is Boston, 'wicked' could be used as an adjective.
        
        IMPORTANT: Please sort the 50 phrases by difficulty, from easiest (for a beginner) to hardest.

        Provide a response in this exact JSON format:
        {
          "plan": [
            {
              "en": "<The English phrase>",
              "translation": "<The translation in ${targetLanguage}>",
              "phonetic": "<The ${phoneticGuide} for the English phrase>",
              "category": "<e.g., Customer, Navigation, Payment, General>",
              "context": "<A brief context for when to use the phrase>"
            }
          ]
        }
        
        Example for a Mandarin speaker:
        {
          "plan": [
            {
              "en": "Hello",
              "translation": "你好",
              "phonetic": "Nǐ hǎo",
              "category": "General",
              "context": "A common greeting."
            },
            {
              "en": "I have your order.",
              "translation": "我有你的订单。",
              "phonetic": "Wǒ yǒu nǐ de dìngdān.",
              "category": "Customer",
              "context": "Use when arriving at the delivery location."
            }
          ]
        }`;

      const contents = [{ role: 'user', parts: [{ text: userPrompt }] }];
      // --- END FIX ---


      const jsonConfig = {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            "plan": {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  "en": { "type": "STRING" },
                  "translation": { "type": "STRING" },
                  "phonetic": { "type": "STRING" },
                  "category": { "type": "STRING" },
                  "context": { "type": "STRING" }
                },
                required: ["en", "translation", "phonetic", "category", "context"]
              }
            }
          },
          required: ["plan"]
        }
      };

      try {
        // --- FIX: Pass both the system prompt and the new contents ---
        const responseText = await callGeminiText(systemPrompt, contents, jsonConfig);
        // --- END FIX ---
        
        // --- FIX 1: Check for empty string from callGeminiText ---
        if (!responseText || responseText.trim() === "") {
          console.error("Failed to generate learning plan: Gemini returned an empty plan string.");
          throw new Error("We couldn't build your plan. The AI returned an empty response. Please try again.");
        }
        // --- END FIX 1 ---

        const { plan } = JSON.parse(responseText);
        
        // --- FIX 2: Check for empty plan array ---
        if (!plan || plan.length === 0) {
           console.error("Failed to generate learning plan: AI returned a plan with 0 items.");
           throw new Error("We couldn't build your plan. The AI returned an empty plan. Please try again.");
        }
        // --- END FIX 2 ---

        onPlanGenerated(plan); // Pass the plan to App and switch to 'home'
      } catch (err) {
        console.error("Failed to generate learning plan:", err);
        
        // --- FIX 3: Pass a user-friendly message from the error ---
        // --- UPDATED FIX: Check for 401 ---
        let errorMessage = err.message || "We couldn't build your plan. Please try again.";
        if (err.message && (err.message.includes("401") || err.message.toLowerCase().includes("unauthorized"))) {
          errorMessage = "Authentication failed (Error 401). This environment's API key is missing, invalid, or not authorized. Please check the API key setup.";
        } else if (err.message && err.message.includes("400")) {
           errorMessage = `Failed to generate plan (Error 400): ${err.message}. This might be an issue with the API request.`;
        }
        setError(errorMessage);
        // --- END UPDATED FIX ---
        // --- END FIX 3 ---
        
        setStatus('error');
      }
    };

    generatePlan();
  }, [userPersona, onPlanGenerated]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      {status === 'generating' && (
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-6 mx-auto"></div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Building your personalized plan...</h2>
          <p className="text-gray-600">We're tailoring lessons just for you.</p>
        </div>
      )}
      {status === 'error' && (
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6 mx-auto">
            <Icon name="info" size={40} className="text-red-600" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Oops! Something went wrong.</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} // Simple retry
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl shadow-md transition-colors"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};
// --- End of New Screen 3 ---


export default () => {
  const [currentScreen, setCurrentScreen] = useState('onboarding');
  const [language, setLanguage] = useState('EN');
  const [pronunciationPhrase, setPronunciationPhrase] = useState(null);
  
  // --- MODIFIED: Centralized State ---
  const [userPersona, setUserPersona] = useState(null);
  const [learningPlan, setLearningPlan] = useState([]); // This will hold the AI-generated plan
  const [currentLesson, setCurrentLesson] = useState(null); // Will hold { id, title, phrases }
  const [completedLessonIds, setCompletedLessonIds] = useState([]); // e.g., ['lesson1']
  // --- NEW: Recent Activity State ---
  const [recentActivity, setRecentActivity] = useState([
    { id: 1, text: 'Welcome to CYJNA!', time: 'Now' },
  ]);

  const showOnboarding = currentScreen === 'onboarding' || currentScreen === 'onboarding-step-2' || currentScreen === 'learning-plan-generator';

  // --- NEW: Onboarding Completion Handler ---
  const handleOnboardingComplete = (personaData) => {
    setUserPersona(personaData);
    setCurrentScreen('learning-plan-generator');
  };

  // --- NEW: Plan Generation Handler ---
  const handlePlanGenerated = (plan) => {
    setLearningPlan(plan);
    setCurrentScreen('home'); // All done, go to the app!
  };

  // --- MODIFIED: Screen switching logic ---
  const handleSetCurrentScreen = (screen) => {
    // If user clicks "Chat" from bottom nav, reset the lesson context
    if (screen === 'chat-main') {
      setCurrentLesson(null); // Clear lesson context
      setCurrentScreen('chat'); // Go to chat screen
    } else {
      setCurrentScreen(screen);
    }
  };


  return (
    <div className="app">
      {/* Only show TopBar if NOT on onboarding */}
      {!showOnboarding && (
        <TopBar 
          language={language} 
          setLanguage={setLanguage} 
          currentScreen={currentScreen}
          setCurrentScreen={handleSetCurrentScreen} // Use handler
        />
      )}
      
      {currentScreen === 'onboarding' && <OnboardingScreen setCurrentScreen={handleSetCurrentScreen} />}
      {currentScreen === 'onboarding-step-2' && <OnboardingStepTwoScreen onCompleteOnboarding={handleOnboardingComplete} setCurrentScreen={handleSetCurrentScreen} />}
      {currentScreen === 'learning-plan-generator' && <LearningPlanScreen userPersona={userPersona} onPlanGenerated={handlePlanGenerated} />}
      
      {currentScreen === 'home' && <HomeScreen 
        setCurrentScreen={handleSetCurrentScreen} 
        completedLessonIds={completedLessonIds} 
        recentActivity={recentActivity} 
      />}
      
      {/* --- NEW LESSON FLOW --- */}
      {currentScreen === 'lesson-list' && <LessonListScreen learningPlan={learningPlan} setCurrentScreen={handleSetCurrentScreen} setCurrentLesson={setCurrentLesson} />}
      {currentScreen === 'lesson-detail' && <LessonDetailScreen 
        currentLesson={currentLesson} 
        setCurrentScreen={handleSetCurrentScreen} 
        completedLessonIds={completedLessonIds} 
        setCompletedLessonIds={setCompletedLessonIds}
        setRecentActivity={setRecentActivity}
      />}
      {currentScreen === 'flashcards' && <FlashcardScreen 
        setCurrentScreen={handleSetCurrentScreen} 
        setPronunciationPhrase={setPronunciationPhrase} 
        currentLesson={currentLesson} 
      />}
      {currentScreen === 'pronunciation-module' && <PronunciationModuleScreen 
        currentLesson={currentLesson} 
        setCurrentScreen={handleSetCurrentScreen} 
        setPronunciationPhrase={setPronunciationPhrase} 
      />}
      
      {/* --- END NEW LESSON FLOW --- */}

      {currentScreen === 'chat' && <ChatScreen 
        userPersona={userPersona} 
        currentLesson={currentLesson} 
        setRecentActivity={setRecentActivity}
      />}
      {currentScreen === 'pronunciation' && <PronunciationScreen 
        phraseData={pronunciationPhrase} 
        userPersona={userPersona} 
        setCurrentScreen={handleSetCurrentScreen}
        setRecentActivity={setRecentActivity}
      />}
      {currentScreen === 'progress' && <ProgressScreen />}
      
      {/* Only show BottomNav if NOT on onboarding */}
      {!showOnboarding && <BottomNav currentScreen={currentScreen} setCurrentScreen={handleSetCurrentScreen} />}
    </div>
  );
};

