/**
 * ============================================
 * CYJNAV 2.0 - Project Structure Documentation
 * ============================================
 * 
 * This file serves as the guide for understanding the refactored project structure.
 * The monolithic App.js has been separated into modular, reusable components.
 * 
 * DIRECTORY OVERVIEW
 * ==================
 * 
 * src/
 * ├── api/                    - API integration and Gemini API functions
 * │   └── geminiApi.js        - Gemini API calls, TTS, content generation
 * │
 * ├── components/             - Reusable UI components
 * │   ├── Icon.js             - SVG icon component with all app icons
 * │   ├── AudioPlayer.js      - Audio player for PCM and standard formats
 * │   ├── LoadingScreen.js    - Full-screen loading indicator
 * │   ├── ErrorScreen.js      - Full-screen error display
 * │   └── NavBar.js           - Bottom navigation bar for main screens
 * │
 * ├── config/                 - Configuration and constants
 * │   └── apiConfig.js        - API endpoints and keys
 * │
 * ├── screens/                - Full-page screen components
 * │   ├── LoginScreen.js             - User login screen
 * │   ├── OnboardingScreen.js        - Language selection (Step 1)
 * │   ├── OnboardingStepTwoScreen.js - Level & goals (Step 2)
 * │   ├── HomeScreen.js              - Main dashboard
 * │   ├── LessonListScreen.js        - All lessons view
 * │   ├── LessonDetailScreen.js      - Detailed lesson content & quiz
 * │   ├── FlashcardScreen.js         - Flashcard study mode
 * │   ├── StatsScreen.js             - User statistics & leaderboard
 * │   └── PronunciationScreen.js     - Pronunciation practice modal
 * │
 * ├── utils/                  - Utility functions
 * │   └── audioHelpers.js     - Audio processing helpers
 * │
 * ├── App.js                  - Main app component with state & routing
 * ├── App.css                 - Global app styles (legacy - use Tailwind)
 * ├── index.js                - Application entry point
 * ├── index.css               - Global styles with Tailwind directives
 * └── tailwind.config.js      - Tailwind CSS configuration
 * 
 * ROOT FILES
 * ==========
 * package.json               - Project dependencies and scripts
 * tailwind.config.js         - Tailwind CSS configuration (in root)
 * postcss.config.js          - PostCSS configuration for Tailwind
 * 
 * 
 * KEY FEATURES
 * ============
 * 
 * 1. MODULAR ARCHITECTURE
 *    - Separation of concerns: Screens, Components, Utils, API
 *    - Each file has a single responsibility
 *    - Easy to maintain and extend
 * 
 * 2. TAILWIND CSS INTEGRATION
 *    - Utility-first CSS framework
 *    - No CSS files needed (all styles use Tailwind classes)
 *    - Fast development and consistent design
 * 
 * 3. STATE MANAGEMENT
 *    - React hooks (useState, useEffect)
 *    - localStorage persistence for user data
 *    - Global state via context (App.js)
 * 
 * 4. API INTEGRATION
 *    - Gemini API for content generation
 *    - Text-to-speech for pronunciation
 *    - Lesson content and flashcard generation
 * 
 * 
 * IMPORTANT CONFIGURATION STEPS
 * ==============================
 * 
 * 1. GEMINI API KEY
 *    Location: src/config/apiConfig.js
 *    - Replace the empty GEMINI_API_KEY with your actual API key
 *    - This is REQUIRED for the app to function
 * 
 * 2. TAILWIND CSS
 *    - Already configured in tailwind.config.js
 *    - PostCSS configured in postcss.config.js
 *    - No additional setup needed
 * 
 * 3. Run the Application
 *    npm start       - Start development server
 *    npm build       - Build for production
 *    npm test        - Run tests
 * 
 * 
 * COMPONENT COMMENTS
 * ===================
 * 
 * Each file includes comprehensive comments explaining:
 * - Purpose and responsibilities
 * - Props and parameters
 * - Key functions and features
 * - Usage examples where applicable
 * 
 * 
 * SCREENS & NAVIGATION
 * ====================
 * 
 * Authentication Flow:
 *   login → onboarding → onboarding-step-2 → home
 * 
 * Main App Screens (with NavBar):
 *   home → lesson-list → lesson-detail
 *   home → flashcards
 *   home → stats
 *   home → pronunciation (modal overlay)
 * 
 * 
 * API ENDPOINTS
 * =============
 * 
 * Core API Functions (src/api/geminiApi.js):
 * - fetchWithBackoff()        - Fetch with exponential backoff retry
 * - fetchTTS()                - Text-to-speech conversion
 * - fetchJsonFromGemini()     - Structured JSON response
 * - fetchLearningPlan()       - Generate 10-lesson curriculum
 * - fetchLessonContent()      - Generate detailed lesson with quiz
 * - fetchFlashcards()         - Generate flashcards from lessons
 * 
 * 
 * STYLING WITH TAILWIND
 * =====================
 * 
 * Key Tailwind Classes Used:
 * - bg-{color}: Background color
 * - text-{color}: Text color
 * - p-{size}: Padding
 * - m-{size}: Margin
 * - rounded-{size}: Border radius
 * - shadow-{level}: Shadow effects
 * - hover:{utility}: Hover effects
 * - flex/grid: Layout
 * - transition-{property}: Animations
 * 
 * Custom Tailwind Config:
 * - Primary color (blue-500)
 * - Custom spacing for nav height
 * - Extended color palette
 * 
 * 
 * EXAMPLES
 * ========
 * 
 * Importing a component:
 *   import HomeScreen from './screens/HomeScreen';
 *   import Icon from './components/Icon';
 * 
 * Using an API function:
 *   import { fetchLearningPlan } from './api/geminiApi';
 *   const plan = await fetchLearningPlan(native, target, level, goals);
 * 
 * Creating a styled component:
 *   <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
 *     Click me
 *   </button>
 * 
 * 
 * TROUBLESHOOTING
 * ===============
 * 
 * Issue: "API key is empty"
 *   Solution: Add your Gemini API key to src/config/apiConfig.js
 * 
 * Issue: "Tailwind styles not working"
 *   Solution: Restart dev server, ensure all Tailwind classes are used correctly
 * 
 * Issue: "Module not found errors"
 *   Solution: Check import paths, ensure all files exist in correct directories
 * 
 * 
 * NEXT STEPS
 * ==========
 * 
 * 1. Add API key to config/apiConfig.js
 * 2. Run: npm install (to install any missing dependencies)
 * 3. Run: npm start (to start development server)
 * 4. Test all screens and features
 * 5. Deploy to production when ready
 */

export default "PROJECT_STRUCTURE";
