/**
 * Icon Component
 * 
 * This component renders SVG icons based on the 'name' prop.
 * It includes all icons from the frontend including 'flashcards', 'play', 'pause', etc.
 * 
 * Usage:
 * <Icon name="home" size={24} className="text-blue-500" />
 * 
 * Props:
 * - name: Icon name (string)
 * - size: Icon size in pixels (default: 24)
 * - className: Additional CSS classes (default: "")
 */

import React from 'react';

const Icon = ({ name, size = 24, className = "" }) => {
  const icons = {
    home: <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
    book: <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13c-1.168.776-2.754 1.253-4.5 1.253s-3.332-.477-4.5-1.253" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
    'chart-bar': <path d="M3 12v5m5-9v9m5-7v7m5-3v3M3 3h18v18H3V3z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
    user: <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
    chevron: <path d="M9 5l7 7-7 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
    mic: <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3zM19 10v2a7 7 0 01-14 0v-2M12 19v3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
    x: <path d="M18 6L6 18M6 6l12 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
    'volume-2': <path d="M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
    play: <path d="M5 3l14 9-14 9V3z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
    pause: <path d="M6 4h4v16H6zM14 4h4v16h-4z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
    check: <path d="M20 6L9 17l-5-5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
    flashcards: <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7M3 7l9-4 9 4M3 7h18m-9 4v10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
    loading: <path d="M12 3v3m0 12v3m9-9h-3M3 12H0m16.97-4.97l-2.12-2.12M4.15 19.85l-2.12-2.12m12.72 0l2.12-2.12M4.15 4.15l2.12 2.12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
  };

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      className={className}
    >
      {icons[name] || <path d="M12 12m-10 0a10 10 0 1020 0 10 10 0 10-20 0" />}
    </svg>
  );
};

export default Icon;
