/**
 * LoadingScreen Component
 * 
 * A full-screen loading indicator with animated spinner and message.
 * 
 * Props:
 * - message: Loading message to display (default: "Loading...")
 */

import React from 'react';
import Icon from './Icon';

const LoadingScreen = ({ message = "Loading..." }) => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-700">
    <Icon name="loading" className="animate-spin text-blue-500 w-12 h-12" />
    <p className="mt-4 text-lg font-medium">{message}</p>
  </div>
);

export default LoadingScreen;
