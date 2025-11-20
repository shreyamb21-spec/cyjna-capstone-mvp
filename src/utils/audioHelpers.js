/**
 * Audio Utilities Module
 * 
 * This file contains all audio-related helper functions including:
 * - Base64 to ArrayBuffer conversion
 * - PCM to WAV audio conversion
 * - Audio playback utilities
 */

/**
 * Decodes a Base64 string to an ArrayBuffer
 * Used for converting encoded audio data from API responses
 * 
 * @param {string} base64 - The Base64 encoded string
 * @returns {ArrayBuffer} The decoded binary data
 */
export function base64ToArrayBuffer(base64) {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Converts raw PCM audio data (Int16Array) to a WAV file format
 * PCM (Pulse Code Modulation) is the raw audio format returned by Gemini TTS
 * WAV is the format that browsers can play natively
 * 
 * @param {Int16Array} pcmData - The raw PCM audio samples
 * @param {number} sampleRate - The sample rate in Hz (e.g., 24000, 16000)
 * @returns {Blob} A WAV format audio blob ready for playback
 */
export function pcmToWav(pcmData, sampleRate) {
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

/**
 * Creates and plays an audio blob URL
 * Handles cleanup of the object URL after playback
 * 
 * @param {Blob} audioBlob - The audio blob to play
 * @returns {Promise} Resolves when audio playback completes
 */
export function playAudioBlob(audioBlob) {
  return new Promise((resolve, reject) => {
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    
    audio.onended = () => {
      URL.revokeObjectURL(audioUrl);
      resolve();
    };
    
    audio.onerror = (error) => {
      URL.revokeObjectURL(audioUrl);
      reject(error);
    };
    
    audio.play().catch(reject);
  });
}
