/**
 * API Functions
 * 
 * This module contains all functions that interact with the Gemini API.
 * It handles text-to-speech, JSON generation, learning plans, and flashcards.
 * 
 * Functions:
 * - fetchWithBackoff: Fetch with exponential backoff retry logic
 * - fetchTTS: Text-to-speech API call
 * - fetchJsonFromGemini: Generate JSON response from Gemini
 * - fetchLearningPlan: Generate a learning curriculum
 * - fetchLessonContent: Generate detailed lesson content
 * - fetchFlashcards: Generate flashcards from completed lessons
 */

import { GEMINI_TEXT_API_URL, GEMINI_TTS_API_URL } from '../config/apiConfig';

/**
 * Retries a fetch request with exponential backoff.
 * @param {string} url - The URL to fetch
 * @param {object} options - Fetch options
 * @param {number} retries - Number of retries remaining
 * @param {number} delay - Current delay in milliseconds
 * @returns {Promise<object>} The JSON response
 */
export async function fetchWithBackoff(url, options, retries = 5, delay = 1000) {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      if (response.status === 429 && retries > 0) {
        console.warn(`Rate limited. Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchWithBackoff(url, options, retries - 1, delay * 2);
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error("Fetch error:", error);
    if (retries > 0 && error.message.includes('HTTP error') === false) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithBackoff(url, options, retries - 1, delay * 2);
    }
    throw error;
  }
}

/**
 * Fetches text-to-speech audio from the Gemini API.
 * @param {string} text - The text to convert to speech
 * @param {string} voice - The voice name (default: "Kore")
 * @param {string} speaker - The speaker ID (default: "Speaker1")
 * @returns {Promise<object>} Object with audioData and mimeType
 */
export async function fetchTTS(text, voice = "Kore", speaker = "Speaker1") {
  const payload = {
    contents: [{
      parts: [{ text: `TTS the following, using a clear and friendly tone: ${text}` }]
    }],
    generationConfig: {
      responseModalities: ["AUDIO"],
      speechConfig: {
        multiSpeakerVoiceConfig: {
          speakerVoiceConfigs: [
            { speaker: speaker, voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } }
          ]
        }
      }
    },
    model: "gemini-2.5-flash-preview-tts"
  };

  const result = await fetchWithBackoff(GEMINI_TTS_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const part = result?.candidates?.[0]?.content?.parts?.[0];
  if (part && part.inlineData?.data && part.inlineData?.mimeType) {
    return {
      audioData: part.inlineData.data,
      mimeType: part.inlineData.mimeType
    };
  } else {
    throw new Error("Invalid TTS response from API.");
  }
}

/**
 * Fetches a structured response (JSON) from the Gemini API.
 * @param {string} systemPrompt - System instruction prompt
 * @param {string} userPrompt - User query prompt
 * @param {object} schema - JSON schema for response format
 * @returns {Promise<object>} The parsed JSON response
 */
export async function fetchJsonFromGemini(systemPrompt, userPrompt, schema) {
  const payload = {
    contents: [{ parts: [{ text: userPrompt }] }],
    systemInstruction: {
      parts: [{ text: systemPrompt }]
    },
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: schema,
    },
  };

  const result = await fetchWithBackoff(GEMINI_TEXT_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
  if (text) {
    return JSON.parse(text);
  } else {
    throw new Error("Invalid JSON response from API.");
  }
}

/**
 * Fetches a new learning plan.
 * @param {string} nativeLanguage - User's native language
 * @param {string} targetLanguage - Target language to learn
 * @param {string} level - Learning level (Beginner, Intermediate, Advanced)
 * @param {array} goals - Learning goals (e.g., ['Travel', 'Work'])
 * @returns {Promise<array>} Array of lesson objects
 */
export async function fetchLearningPlan(nativeLanguage, targetLanguage, level, goals) {
  const systemPrompt = "You are an expert language curriculum designer. Create a structured, engaging, and effective learning plan as a JSON array.";
  const userPrompt = `Generate a 10-lesson learning plan for a ${nativeLanguage} speaker learning ${targetLanguage}.
    The user's level is ${level}.
    Their goals are: ${goals.join(", ")}.
    Each lesson must have a unique 'id' (e.g., 'L1', 'L2'), a concise 'title', and a brief 'description' (max 20 words).`;
  
  const schema = {
    type: "ARRAY",
    items: {
      type: "OBJECT",
      properties: {
        id: { type: "STRING" },
        title: { type: "STRING" },
        description: { type: "STRING" }
      },
      required: ["id", "title", "description"]
    }
  };
  
  return fetchJsonFromGemini(systemPrompt, userPrompt, schema);
}

/**
 * Fetches detailed content for a specific lesson.
 * @param {object} lesson - Lesson object with title and description
 * @param {string} nativeLanguage - User's native language
 * @param {string} targetLanguage - Target language
 * @returns {Promise<object>} Lesson content with introduction, phrases, dialogue, explanation, and quiz
 */
export async function fetchLessonContent(lesson, nativeLanguage, targetLanguage) {
  const systemPrompt = "You are an expert language tutor. Create a detailed, multi-part lesson based on the user's request. Respond in valid JSON.";
  const userPrompt = `Generate content for this lesson:
    Title: ${lesson.title}
    Description: ${lesson.description}
    Native Language: ${nativeLanguage}
    Target Language: ${targetLanguage}

    The content must include:
    1.  'introduction': A brief paragraph (in ${nativeLanguage}) explaining the lesson's concept.
    2.  'key_phrases': An array of objects, each with 'phrase' (in ${targetLanguage}) and 'translation' (in ${nativeLanguage}).
    3.  'dialogue': An array of objects, each with 'speaker' and 'line' (in ${targetLanguage}).
    4.  'explanation': A detailed grammar/cultural explanation (in ${nativeLanguage}).
    5.  'quiz': An array of 3 multiple-choice questions, each with 'question' (in ${nativeLanguage}), 'options' (array of strings in ${targetLanguage}), and 'correct_answer' (string in ${targetLanguage}).`;

  const schema = {
    type: "OBJECT",
    properties: {
      introduction: { type: "STRING" },
      key_phrases: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            phrase: { type: "STRING" },
            translation: { type: "STRING" }
          },
          required: ["phrase", "translation"]
        }
      },
      dialogue: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            speaker: { type: "STRING" },
            line: { type: "STRING" }
          },
          required: ["speaker", "line"]
        }
      },
      explanation: { type: "STRING" },
      quiz: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            question: { type: "STRING" },
            options: { type: "ARRAY", items: { type: "STRING" } },
            correct_answer: { type: "STRING" }
          },
          required: ["question", "options", "correct_answer"]
        }
      }
    },
    required: ["introduction", "key_phrases", "dialogue", "explanation", "quiz"]
  };

  return fetchJsonFromGemini(systemPrompt, userPrompt, schema);
}

/**
 * Fetches flashcards based on completed lessons.
 * @param {array} completedLessonsData - Array of completed lesson data
 * @param {string} nativeLanguage - User's native language
 * @param {string} targetLanguage - Target language
 * @returns {Promise<array>} Array of flashcard objects with front and back
 */
export async function fetchFlashcards(completedLessonsData, nativeLanguage, targetLanguage) {
  const systemPrompt = "You are a flashcard generator. Create a JSON array of flashcards.";
  const userPrompt = `Generate 10 flashcards based on the following completed lesson content.
    Native Language: ${nativeLanguage}
    Target Language: ${targetLanguage}
    Completed Lessons: ${JSON.stringify(completedLessonsData)}
    
    Create flashcards from the 'key_phrases' in the lessons.
    Each flashcard object must have 'front' (the phrase in ${targetLanguage}) and 'back' (the translation in ${nativeLanguage}).`;
  
  const schema = {
    type: "ARRAY",
    items: {
      type: "OBJECT",
      properties: {
        front: { type: "STRING" },
        back: { type: "STRING" }
      },
      required: ["front", "back"]
    }
  };
  
  return fetchJsonFromGemini(systemPrompt, userPrompt, schema);
}
