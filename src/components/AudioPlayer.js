/**
 * AudioPlayer Component
 * 
 * This component renders an audio player that can play PCM or standard audio formats.
 * It converts Base64-encoded audio data to playable audio.
 * 
 * Props:
 * - base64Audio: Base64-encoded audio data (string)
 * - mimeType: MIME type of the audio (e.g., "audio/L16;rate=24000")
 * 
 * Features:
 * - Supports PCM (audio/L16) and standard audio formats (mp3, ogg, etc.)
 * - Play/pause toggle button
 * - Visual indicator for playing state
 */

import React, { useState, useEffect, useRef } from 'react';
import Icon from './Icon';

const AudioPlayer = ({ base64Audio, mimeType }) => {
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  // Helper function to decode Base64 to ArrayBuffer
  function base64ToArrayBuffer(base64) {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  // Helper function to convert PCM to WAV
  function pcmToWav(pcmData, sampleRate) {
    const numChannels = 1;
    const bitsPerSample = 16;
    const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
    const blockAlign = numChannels * (bitsPerSample / 8);
    const dataSize = pcmData.length * (bitsPerSample / 8);
    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);

    // RIFF header
    view.setUint32(0, 0x52494646, false); // "RIFF"
    view.setUint32(4, 36 + dataSize, true);
    view.setUint32(8, 0x57415645, false); // "WAVE"
    // "fmt " sub-chunk
    view.setUint32(12, 0x666D7420, false); // "fmt "
    view.setUint32(16, 16, true); // Sub-chunk size
    view.setUint16(20, 1, true); // Audio format (1 = PCM)
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);
    // "data" sub-chunk
    view.setUint32(36, 0x64617461, false); // "data"
    view.setUint32(40, dataSize, true);

    // Write PCM data
    let offset = 44;
    for (let i = 0; i < pcmData.length; i++, offset += 2) {
      view.setInt16(offset, pcmData[i], true);
    }

    return new Blob([view], { type: 'audio/wav' });
  }

  useEffect(() => {
    if (base64Audio && mimeType) {
      try {
        if (mimeType.startsWith("audio/L16")) {
          // Handle PCM data
          const sampleRateMatch = mimeType.match(/rate=(\d+)/);
          const sampleRate = sampleRateMatch ? parseInt(sampleRateMatch[1], 10) : 24000;
          const pcmData = base64ToArrayBuffer(base64Audio);
          const pcm16 = new Int16Array(pcmData);
          const wavBlob = pcmToWav(pcm16, sampleRate);
          const url = URL.createObjectURL(wavBlob);
          setAudioUrl(url);
        } else if (mimeType.startsWith("audio/")) {
          // Handle standard audio formats like mp3, ogg
          const byteCharacters = atob(base64Audio);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: mimeType });
          const url = URL.createObjectURL(blob);
          setAudioUrl(url);
        }
      } catch (error) {
        console.error("Error processing audio:", error);
      }
    }

    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base64Audio, mimeType]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  if (!audioUrl) {
    return (
      <button
        disabled
        className="p-2 rounded-full bg-gray-200 text-gray-500 cursor-not-allowed"
      >
        <Icon name="volume-2" />
      </button>
    );
  }

  return (
    <div>
      <audio
        ref={audioRef}
        src={audioUrl}
        onEnded={handleAudioEnded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
      <button
        onClick={togglePlay}
        className="p-3 rounded-full bg-blue-500 text-white shadow-lg transition-transform hover:scale-105"
      >
        <Icon name={isPlaying ? 'pause' : 'play'} />
      </button>
    </div>
  );
};

export default AudioPlayer;
