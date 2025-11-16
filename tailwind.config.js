/**
 * Tailwind CSS Configuration
 * 
 * This file contains the configuration for Tailwind CSS.
 * It specifies template paths, theme extensions, and plugins.
 * 
 * Key Configuration:
 * - content: Scans all .js and .jsx files for class names
 * - theme: Extends default theme with custom values
 * - plugins: Registers any additional Tailwind plugins
 */

module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#3b82f6',    // Blue-500
        'success': '#10b981',    // Green-500
        'warning': '#f59e0b',    // Amber-500
        'danger': '#ef4444',     // Red-500
      },
      fontFamily: {
        'sans': ['ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      spacing: {
        'nav-height': '4rem',    // 16px * 4 = 64px for navigation bar
      },
    },
  },
  plugins: [],
};
