/**
 * API Configuration and Constants
 * 
 * This module contains all API endpoints and configuration constants.
 * 
 * ⚠️ IMPORTANT: The GEMINI_API_KEY is empty by default.
 * YOU MUST REPLACE IT WITH A VALID API KEY FOR THE APP TO WORK.
 * 
 * API Keys:
 * - GEMINI_API_KEY: Your Google Gemini API key
 * 
 * Endpoints:
 * - GEMINI_TEXT_API_URL: Endpoint for text generation
 * - GEMINI_TTS_API_URL: Endpoint for text-to-speech
 */

// Per instructions, API key is an empty string.
// YOU MUST REPLACE "" WITH A VALID API KEY FOR THE APP TO WORK.
export const GEMINI_API_KEY = ""; // <--- IMPORTANT: ADD YOUR API KEY HERE

export const GEMINI_TEXT_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${GEMINI_API_KEY}`;

export const GEMINI_TTS_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${GEMINI_API_KEY}`;
