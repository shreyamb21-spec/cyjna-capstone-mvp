import React, { useState, useEffect } from 'react';
import { callGeminiText } from '../api/geminiApi';
import Icon from '../components/Icon';

/**
 * ChatScreen Component
 * 
 * AI-powered conversation practice with industry-specific scenarios.
 * Supports both general chat and lesson-specific practice.
 */
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

  const industry = userPersona?.targetIndustry || 'delivery';
  const city = userPersona?.targetCity || 'a major US city';
  const lessonPhrases = currentLesson?.phrases?.map(p => p.en).join(', ') || null;
  
  const customerSystemPrompt = {
    parts: [{ text: `You are an AI practice partner for English learning. The user practices English for the '${industry}' industry in '${city}'.
    Your role: Act as a person they interact with in that industry (customer, manager, colleague).
    User persona: ${JSON.stringify(userPersona)}.
    Be patient with beginners. Use simple words. Keep replies to 1-2 sentences.
    ${lessonPhrases ? `The user is learning these phrases: [${lessonPhrases}]. Try to create situations where they can use them.` : ''}
    Do not act as the user. Your name is Alex.` }]
  };
  
  const scenarioGeneratorSystemPrompt = {
    parts: [{ text: "You are a scenario generator for an English learning app. Respond in perfect JSON only." }]
  };
  
  const scenarioGeneratorPrompt = `Generate a new scenario for practicing English in the '${industry}' industry in '${city}'.
  Output format: {"title": "SCENARIO_TITLE", "customer_line": "Opening line from the person the user is interacting with"}
  Make it realistic and relevant to the industry.`;

  useEffect(() => {
    let interval;
    if (recordingState === 'recording') {
      interval = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [recordingState]);
  
  useEffect(() => {
    const chatTitle = currentLesson ? `Lesson: ${currentLesson.title}` : `General: ${initialScenario.title}`;
    const firstMessage = currentLesson ? 'Hi there! Let\'s practice what you just learned.' : initialScenario.customer_line;
    
    setMessages([
      { type: 'ai', text: firstMessage, time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) }
    ]);
  }, [currentLesson, initialScenario]);

  const formatChatHistory = (msgs) => {
    return msgs.map(msg => ({
      role: msg.type === 'ai' ? 'model' : 'user',
      parts: [{ text: msg.text.split('\n')[0] }]
    }));
  };

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
      
      getAiResponse(newMessages);
    }
  };

  const getAiResponse = async (currentMessages) => {
    setIsAiResponding(true);
    try {
      const chatHistory = formatChatHistory(currentMessages);
      const aiText = await callGeminiText(customerSystemPrompt, chatHistory);

      setMessages(prev => [...prev, { 
        type: 'ai', 
        text: aiText, 
        time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) 
      }]);
    } catch (error) {
      if (error.message && (error.message.includes("401") || error.message.toLowerCase().includes("unauthorized"))) {
        setChatError("Authentication failed (Error 401). This environment's API key is missing or invalid.");
      } else {
        setChatError("The AI failed to respond. Please try again.");
      }
    } finally {
      setIsAiResponding(false);
    }
  };

  const getNewScenario = async () => {
    if (isGeneratingScenario || currentLesson) return;
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

      const contents = [{ role: 'user', parts: [{ text: scenarioGeneratorPrompt }] }];
      const responseText = await callGeminiText(scenarioGeneratorSystemPrompt, contents, jsonConfig);

      const newScenario = JSON.parse(responseText);
      setInitialScenario(newScenario);
      setRecentActivity(prevActivity => [
        { id: Date.now(), text: `Started chat: ${newScenario.title}`, time: 'Just now' },
        ...prevActivity.slice(0, 4)
      ]);
    } catch (error) {
      if (error.message && (error.message.includes("401") || error.message.toLowerCase().includes("unauthorized"))) {
        setChatError("Authentication failed (Error 401). This environment's API key is missing or invalid.");
      } else {
        setChatError("Failed to generate a new scenario. Please try again.");
      }
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

export default ChatScreen;
