/**
 * PostCSS Configuration
 * 
 * This file configures PostCSS to process CSS with Tailwind CSS v3 and Autoprefixer.
 * PostCSS is a tool to transform CSS using JavaScript plugins.
 * 
 * Plugins:
 * - tailwindcss: Adds utility-first CSS framework (v3)
 * - autoprefixer: Adds vendor prefixes to CSS for browser compatibility
 */

module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
