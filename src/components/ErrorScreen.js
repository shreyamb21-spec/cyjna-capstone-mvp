/**
 * ErrorScreen Component
 * 
 * A full-screen error display with retry button.
 * 
 * Props:
 * - error: Error message to display
 * - onRetry: Callback function when retry button is clicked
 */

import React from 'react';

const ErrorScreen = ({ error, onRetry }) => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 text-red-700 p-4">
    <h2 className="text-2xl font-bold mb-4">Oops! Something went wrong.</h2>
    <p className="text-center mb-6">{error || "An unknown error occurred."}</p>
    <button
      onClick={onRetry}
      className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold shadow-md transition-colors hover:bg-red-700"
    >
      Try Again
    </button>
  </div>
);

export default ErrorScreen;
