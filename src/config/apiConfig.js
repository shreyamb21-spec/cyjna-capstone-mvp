/**
 * API Configuration Module
 * 
 * This file contains all API configuration and endpoints.
 * 
 * ⚠️ IMPORTANT: Replace the empty GEMINI_API_KEY with your actual API key for the app to work.
 * Get your API key from: https://ai.google.dev/
 */

// Gemini API Configuration
export const GEMINI_API_KEY = "AIzaSyAYB08lrPWeZzv_HXdzRp-0mFsTGZVoFqE";

// API Endpoints
export const GEMINI_TEXT_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${GEMINI_API_KEY}`;
export const GEMINI_TTS_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${GEMINI_API_KEY}`;

// Models
export const TEXT_MODEL = "gemini-2.5-flash-preview-09-2025";
export const TTS_MODEL = "gemini-2.5-flash-preview-tts";

// Default configurations
export const DEFAULT_LANGUAGE = "en";
export const DEFAULT_INDUSTRY = "delivery";
export const DEFAULT_CITY = "a major US city";
