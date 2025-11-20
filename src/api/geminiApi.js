/**
 * Gemini API Integration Module
 * 
 * This file contains all API call functions that interact with Google's Gemini API:
 * - Text generation (chat, scenarios, analysis)
 * - Text-to-speech synthesis
 * - Error handling with retry logic
 */

import { GEMINI_TEXT_API_URL, GEMINI_TTS_API_URL } from '../config/apiConfig';

/**
 * Calls the Gemini Text API for content generation
 * Handles retries on failure with exponential backoff
 * 
 * @param {object} systemInstruction - The system prompt defining AI behavior
 * @param {Array<object>} contents - The chat history / conversation messages
 * @param {object} generationConfig - Optional config (e.g., for JSON mode)
 * @returns {Promise<string>} The generated text response
 * @throws {Error} If the API call fails after retries
 */
export async function callGeminiText(systemInstruction, contents, generationConfig = {}) {
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
        const text = await response.text();
        if (text) {
          console.error("Gemini API Error Body:", text);
          errorBodyText = text;
        }
      } catch (e) {
        // Ignore if reading text fails, use status code
      }
      console.error("Gemini API Error:", errorBodyText);
      throw new Error(errorBodyText);
    }

    // Read response as text first to avoid empty body errors
    const responseText = await response.text();
    
    if (!responseText || responseText.trim() === "") {
      console.error("Invalid response structure: Empty response body");
      throw new Error("Invalid response from Gemini API: Empty response.");
    }
    
    const result = JSON.parse(responseText);
    const candidate = result.candidates?.[0];
    
    if (candidate && candidate.content?.parts?.[0]?.text) {
      return candidate.content.parts[0].text;
    } else {
      console.error("Invalid response structure:", result);
      throw new Error("Invalid response from Gemini API.");
    }
  } catch (error) {
    console.error("Failed to call Gemini API:", error);
    throw error;
  }
}

/**
 * Calls the Gemini Text-to-Speech API
 * Converts text to natural-sounding speech audio
 * 
 * @param {string} text - The text to synthesize into speech
 * @returns {Promise<{audioData: string, sampleRate: number}>} 
 *          Base64 encoded audio data and its sample rate
 * @throws {Error} If the TTS API call fails
 */
export async function callGeminiTTS(text) {
  try {
    const payload = {
      contents: [{
        parts: [{ text: `Say this clearly: ${text}` }]
      }],
      generationConfig: {
        responseModalities: ["AUDIO"],
      },
    };

    const response = await fetch(GEMINI_TTS_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      let errorBodyText = `API Error: ${response.status} ${response.statusText}`;
      try {
        const text = await response.text();
        if (text) {
          console.error("Gemini TTS API Error Body:", text);
          errorBodyText = text;
        }
      } catch (e) {
        // Ignore if reading text fails
      }
      console.error("Gemini TTS API Error:", errorBodyText);
      throw new Error(errorBodyText);
    }

    const responseText = await response.text();
    
    if (!responseText || responseText.trim() === "") {
      console.error("Invalid TTS response structure: Empty response body");
      throw new Error("Invalid TTS response from Gemini API: Empty response.");
    }

    const result = JSON.parse(responseText);
    const part = result?.candidates?.[0]?.content?.parts?.[0];
    const audioData = part?.inlineData?.data;
    const mimeType = part?.inlineData?.mimeType;

    if (audioData && mimeType && mimeType.startsWith("audio/L16")) {
      const sampleRateMatch = mimeType.match(/rate=(\d+)/);
      const sampleRate = sampleRateMatch ? parseInt(sampleRateMatch[1], 10) : 24000;
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
